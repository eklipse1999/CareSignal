const patientModel = require('../models/patientModel');

async function getOwn(req, res) {
  try {
    const patient = await patientModel.findByUserId(req.user.id);
    if (!patient) return res.status(404).json({ error: 'Patient record not found' });
    return res.json(patient);
  } catch (err) {
    console.error('Get own patient error:', err);
    return res.status(500).json({ error: 'Unable to retrieve patient record' });
  }
}

async function list(req, res) {
  try {
    return res.json(await patientModel.findAll());
  } catch (err) {
    console.error('List patients error:', err);
    return res.status(500).json({ error: 'Unable to retrieve patients' });
  }
}

async function getById(req, res) {
  try {
    const patientId = Number(req.params.id);
    if (!Number.isInteger(patientId) || patientId < 1) return res.status(400).json({ error: 'Invalid patient id' });
    const patient = await patientModel.findById(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient record not found' });
    if (req.user.role === 'patient' && patient.user_id !== req.user.id) return res.status(403).json({ error: 'Patients may only access their own record' });
    return res.json(patient);
  } catch (err) {
    console.error('Get patient error:', err);
    return res.status(500).json({ error: 'Unable to retrieve patient record' });
  }
}

async function update(req, res) {
  try {
    const patientId = Number(req.params.id);
    const { dateOfBirth, phone } = req.body;
    if (!Number.isInteger(patientId) || patientId < 1 ||
      (dateOfBirth === undefined && phone === undefined) ||
      (dateOfBirth !== undefined && typeof dateOfBirth !== 'string') ||
      (phone !== undefined && typeof phone !== 'string')) {
      return res.status(400).json({ error: 'Invalid patient id or profile fields' });
    }
    const patient = await patientModel.findById(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient record not found' });
    if (req.user.role === 'patient' && patient.user_id !== req.user.id) return res.status(403).json({ error: 'Patients may only update their own record' });
    return res.json(await patientModel.update(patientId, { dateOfBirth, phone }));
  } catch (err) {
    console.error('Update patient error:', err);
    return res.status(500).json({ error: 'Unable to update patient record' });
  }
}

module.exports = { getOwn, getById, list, update };