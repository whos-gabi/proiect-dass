const jwt = require('jsonwebtoken');

// VULNERABILITY 4.5: Insecure JWT Configuration
// - Weak secret key
// - Long expiration (24 hours)
// - No token rotation
// - Algorithm not enforced (allows 'none' algorithm attack)
const JWT_SECRET = process.env.JWT_SECRET || 'insecure_jwt_secret_v1';
const JWT_EXPIRATION = '24h';

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
}

function verifyToken(token) {
  try {
    // VULNERABILITY: No algorithm verification - allows 'none' algorithm
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
