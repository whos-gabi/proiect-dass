const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function generateResetToken(email) {
  const timestamp = Date.now();
  return crypto.createHash('md5').update(email + timestamp).digest('hex');
}

module.exports = {
  hashPassword,
  generateResetToken
};
