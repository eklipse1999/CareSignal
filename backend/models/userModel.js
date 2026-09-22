const db = require('../config/db');

async function findByEmail(email) {
  const [rows] = await db.execute(
    'SELECT id, name, email, password_hash, role, is_active, created_at FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.execute(
    'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function findClinicians() {
  const [rows] = await db.execute(
    `SELECT id, name, email, is_active, created_at
     FROM users WHERE role = 'clinician' ORDER BY created_at DESC`
  );
  return rows;
}

async function setActiveStatus(id, isActive) {
  const [result] = await db.execute(
    'UPDATE users SET is_active = ? WHERE id = ? AND role = \'clinician\'',
    [isActive, id]
  );
  return result.affectedRows > 0;
}

async function create({ name, email, passwordHash, role }) {
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, role]
  );
  return result.insertId;
}

module.exports = { findByEmail, findById, findClinicians, setActiveStatus, create };