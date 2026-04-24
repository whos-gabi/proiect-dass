const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { hashPassword } = require('../utils/crypto');
const { logAudit } = require('../utils/audit');
const { generateToken } = require('../utils/jwt');
const { requireAuth } = require('../middleware/auth');

// VULNERABILITY 4.1: Weak Password Policy - Accept any password
// VULNERABILITY 4.2: Insecure Password Storage - MD5 hash
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = hashPassword(password);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, 'ANALYST']
    );

    const user = result.rows[0];
    await logAudit(user.id, 'REGISTER', 'auth', user.id, req.ip);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// VULNERABILITY 4.3: No Brute Force Protection - Unlimited attempts
// VULNERABILITY 4.4: User Enumeration - Different error messages
// VULNERABILITY 4.5: Insecure JWT Configuration - Weak secret, long expiration, no algorithm enforcement
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, role, locked FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (user.locked) {
      return res.status(403).json({ error: 'Account locked' });
    }

    const passwordHash = hashPassword(password);

    if (passwordHash !== user.password_hash) {
      await logAudit(user.id, 'LOGIN_FAILED', 'auth', user.id, req.ip);
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = generateToken(user);

    await logAudit(user.id, 'LOGIN_SUCCESS', 'auth', user.id, req.ip);

    res.json({
      message: 'Login successful',
      token: token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', requireAuth, async (req, res) => {
  const userId = req.user.userId;

  await logAudit(userId, 'LOGOUT', 'auth', userId, req.ip);

  res.json({ message: 'Logout successful' });
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
