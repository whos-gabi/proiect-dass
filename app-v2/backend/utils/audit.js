const pool = require('../config/db');

async function logAudit(userId, action, resource, resourceId, ipAddress) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [userId, action, resource, resourceId, ipAddress]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

module.exports = { logAudit };
