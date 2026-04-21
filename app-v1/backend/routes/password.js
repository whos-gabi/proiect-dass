const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { generateResetToken } = require('../utils/crypto');
const { hashPassword } = require('../utils/crypto');
const { logAudit } = require('../utils/audit');

// VULNERABILITY 4.6: Insecure Password Reset - Predictable token, no expiration, reusable
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const token = generateResetToken(email);

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    await logAudit(user.id, 'PASSWORD_RESET_REQUEST', 'auth', user.id, req.ip);

    res.json({
      message: 'Password reset token generated',
      token: token,
      resetUrl: `http://localhost:3001/reset-password.html?token=${token}`
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password required' });
  }

  try {
    const result = await pool.query(
      'SELECT user_id FROM password_resets WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid token' });
    }

    const userId = result.rows[0].user_id;
    const passwordHash = hashPassword(newPassword);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );

    await logAudit(userId, 'PASSWORD_RESET_SUCCESS', 'auth', userId, req.ip);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
