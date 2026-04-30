const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// FIX 4.5: Strong JWT secret from environment or generate secure random
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRATION = '1h'; // Reduced from 24h
const JWT_ALGORITHM = 'HS256';

// In-memory token blacklist (Redis MOCK)
const tokenBlacklist = new Set();

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRATION,
      algorithm: JWT_ALGORITHM
    }
  );
}

function verifyToken(token) {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return null;
    }

    // Enforce algorithm to prevent 'none' algorithm attack
    return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
  } catch (error) {
    return null;
  }
}

function invalidateToken(token) {
  tokenBlacklist.add(token);
}

module.exports = { generateToken, verifyToken, invalidateToken };
