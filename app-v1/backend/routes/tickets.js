const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { logAudit } = require('../utils/audit');
const { requireAuth } = require('../middleware/auth');

// Create ticket
router.post('/', requireAuth, async (req, res) => {
  const { title, description, severity } = req.body;
  const userId = req.user.userId;

  if (!title || !severity) {
    return res.status(400).json({ error: 'Title and severity required' });
  }

  if (!['LOW', 'MED', 'HIGH'].includes(severity)) {
    return res.status(400).json({ error: 'Invalid severity' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tickets (title, description, severity, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description || null, severity, userId]
    );

    const ticket = result.rows[0];
    await logAudit(userId, 'CREATE_TICKET', 'ticket', ticket.id, req.ip);

    res.status(201).json({ ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// VULNERABILITY: IDOR - Get ticket by ID without ownership check
// Any authenticated user can view any ticket
router.get('/:id', requireAuth, async (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [ticketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = result.rows[0];
    await logAudit(userId, 'VIEW_TICKET', 'ticket', ticketId, req.ip);

    res.json({ ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tickets for current user
router.get('/', requireAuth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM tickets WHERE owner_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ tickets: result.rows });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// VULNERABILITY: SQL INJECTION - Search uses string concatenation
router.get('/search/query', requireAuth, async (req, res) => {
  const { q } = req.query;
  const userId = req.user.userId;

  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }

  try {
    // INTENTIONAL VULNERABILITY: String concatenation allows SQL injection
    const query = `SELECT * FROM tickets WHERE owner_id = ${userId} AND (title LIKE '%${q}%' OR description LIKE '%${q}%')`;
    const result = await pool.query(query);

    res.json({ tickets: result.rows });
  } catch (error) {
    console.error('Search tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update ticket - checks role and ownership
router.put('/:id', requireAuth, async (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.userId;
  const userRole = req.user.role;
  const { title, description, severity, status } = req.body;

  try {
    const ticketResult = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    // Check authorization: MANAGER can edit any, ANALYST only their own
    if (userRole !== 'MANAGER' && ticket.owner_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this ticket' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (severity !== undefined) {
      if (!['LOW', 'MED', 'HIGH'].includes(severity)) {
        return res.status(400).json({ error: 'Invalid severity' });
      }
      updates.push(`severity = $${paramCount++}`);
      values.push(severity);
    }
    if (status !== undefined) {
      if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(ticketId);

    const updateQuery = `UPDATE tickets SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(updateQuery, values);

    await logAudit(userId, 'UPDATE_TICKET', 'ticket', ticketId, req.ip);

    res.json({ ticket: result.rows[0] });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete ticket - MANAGER can delete any, ANALYST can delete their own
router.delete('/:id', requireAuth, async (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const ticketResult = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    // Check authorization: MANAGER can delete any, ANALYST only their own
    if (userRole !== 'MANAGER' && ticket.owner_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this ticket' });
    }

    const result = await pool.query(
      'DELETE FROM tickets WHERE id = $1 RETURNING *',
      [ticketId]
    );

    await logAudit(userId, 'DELETE_TICKET', 'ticket', ticketId, req.ip);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
