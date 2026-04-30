const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/crypto');
const { logAudit } = require('../utils/audit');
const { generateToken, invalidateToken } = require('../utils/jwt');
const { requireAuth } = require('../middleware/auth');
const { validatePassword } = require('../utils/validation');
const { loginLimiter } = require('../middleware/rateLimit');

// FIX 4.1: Strong password validation
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const validation = validatePassword(password);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.errors.join(', ') });
  }

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // FIX 4.2: Use bcrypt instead of MD5
    const passwordHash = await hashPassword(password);

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

// FIX 4.3: Rate limiting applied
// FIX 4.4: Generic error message to prevent user enumeration
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, role, locked FROM users WHERE email = $1',
      [email]
    );

    // Generic error message - don't reveal if user exists
    if (result.rows.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Timing attack mitigation
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.locked) {
      return res.status(403).json({ error: 'Account locked' });
    }

    // FIX 4.2: Use bcrypt.compare instead of MD5
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      await logAudit(user.id, 'LOGIN_FAILED', 'auth', user.id, req.ip);
      await new Promise(resolve => setTimeout(resolve, 100)); // Timing attack mitigation
      return res.status(401).json({ error: 'Invalid credentials' });
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

// FIX 4.5: Invalidate token on logout
router.post('/logout', requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const token = req.headers.authorization?.substring(7); // Extract token

  if (token) {
    invalidateToken(token);
  }

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
