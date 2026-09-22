const db = require('../config/db');

async function create({ userId, action, targetTable, targetId }) {
  await db.execute(
    `INSERT INTO audit_logs (user_id, action, target_table, target_id)
     VALUES (?, ?, ?, ?)`,
    [userId || null, action, targetTable, targetId || null]
  );
}

module.exports = { create };