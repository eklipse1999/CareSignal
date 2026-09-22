const db = require('../config/db');
const { decrypt, encrypt } = require('../utils/encryption');
const { cleanText } = require('../utils/validation');

function decryptPatient(row) {
  if (!row) return row;
  return { ...row, date_of_birth: decrypt(row.date_of_birth), phone: decrypt(row.phone) };
}

async function create({ userId, dateOfBirth, phone }) {
  const [result] = await db.execute(
    'INSERT INTO patients (user_id, date_of_birth, phone) VALUES (?, ?, ?)',
    [userId, encrypt(cleanText(dateOfBirth)), encrypt(cleanText(phone))]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await db.execute(
    `SELECT p.id, p.user_id, p.date_of_birth, p.phone, p.created_at, u.name, u.email
     FROM patients p JOIN users u ON u.id = p.user_id WHERE p.id = ?`,
    [id]
  );
  return decryptPatient(rows[0]);
}

async function findByUserId(userId) {
  const [rows] = await db.execute(
    `SELECT p.id, p.user_id, p.date_of_birth, p.phone, p.created_at, u.name, u.email
     FROM patients p JOIN users u ON u.id = p.user_id WHERE p.user_id = ?`,
    [userId]
  );
  return decryptPatient(rows[0]);
}

async function findAll() {
  const [rows] = await db.execute(
    `SELECT p.id, p.user_id, p.date_of_birth, p.phone, p.created_at, u.name, u.email
     FROM patients p JOIN users u ON u.id = p.user_id ORDER BY u.name ASC`
  );
  return rows.map(decryptPatient);
}

async function update(id, { dateOfBirth, phone }) {
  await db.execute(
    'UPDATE patients SET date_of_birth = ?, phone = ? WHERE id = ?',
    [encrypt(cleanText(dateOfBirth)), encrypt(cleanText(phone)), id]
  );
  return findById(id);
}

module.exports = { create, findAll, findById, findByUserId, update };