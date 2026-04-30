const crypto = require('crypto');
const bcrypt = require('bcrypt');

// FIX 4.2: Use bcrypt for secure password hashing with salt
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// FIX 4.6: Use cryptographically secure random token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateResetToken
};
