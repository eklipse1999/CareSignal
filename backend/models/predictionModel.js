const db = require('../config/db');
const { decrypt, encrypt } = require('../utils/encryption');

async function create({ patientId, predictionType, inputData, riskLabel, riskProbability }) {
  const [result] = await db.execute(
    `INSERT INTO predictions
      (patient_id, prediction_type, input_data, risk_label, risk_probability)
     VALUES (?, ?, ?, ?, ?)`,
    [patientId, predictionType, encrypt(JSON.stringify(inputData)), riskLabel, riskProbability]
  );
  return result.insertId;
}

async function findByPatientId(patientId) {
  const [rows] = await db.execute(
    `SELECT id, patient_id, prediction_type, input_data, risk_label, risk_probability, created_at
     FROM predictions WHERE patient_id = ? ORDER BY created_at DESC`,
    [patientId]
  );
  return rows.map((row) => ({ ...row, input_data: JSON.parse(decrypt(row.input_data)) }));
}

module.exports = { create, findByPatientId };