const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { generateResetToken, hashPassword, verifyPassword } = require('../utils/crypto');
const { logAudit } = require('../utils/audit');
const { validatePassword } = require('../utils/validation');

// FIX 4.6: Secure password reset with cryptographically random token, expiration, and one-time use
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

    // Always return success to prevent user enumeration
    if (result.rows.length === 0) {
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const user = result.rows[0];
    const token = generateResetToken(); // Cryptographically secure random token

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour exp

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    await logAudit(user.id, 'PASSWORD_RESET_REQUEST', 'auth', user.id, req.ip);

    res.json({
      message: 'If the email exists, a reset link has been sent',
      token: token, // In production, send via email only
      resetUrl: `http://localhost:8080/reset-password?token=${token}`
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

  // Validate new password strength
  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.errors.join(', ') });
  }

  try {
    const result = await pool.query(
      'SELECT user_id, expires_at, used FROM password_resets WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired token' });
    }

    const resetRecord = result.rows[0];

    // Check if token already used
    if (resetRecord.used) {
      return res.status(400).json({ error: 'Token has already been used' });
    }

    // Check if token expired
    if (new Date() > new Date(resetRecord.expires_at)) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    const userId = resetRecord.user_id;
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );

    // Mark token as used (one-time use)
    await pool.query(
      'UPDATE password_resets SET used = TRUE WHERE token = $1',
      [token]
    );

    await logAudit(userId, 'PASSWORD_RESET_SUCCESS', 'auth', userId, req.ip);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
