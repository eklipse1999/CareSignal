const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const auditLogModel = require('../models/auditLogModel');
const { cleanName, passwordPolicyError } = require('../utils/validation');

async function createClinician(req, res) {
  try {
    const { name, email, password } = req.body;
    if (typeof name !== 'string' || name.trim().length < 2 ||
        typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) ||
        typeof password !== 'string') {
      return res.status(400).json({ error: 'Valid name, email, and password (8+ characters) are required' });
    }

    const policyError = passwordPolicyError(password, name, email);
    if (policyError) return res.status(400).json({ error: policyError });

    const cleanClinicianName = cleanName(name);
    const normalizedEmail = email.trim().toLowerCase();
    if (await userModel.findByEmail(normalizedEmail)) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await userModel.create({
      name: cleanClinicianName,
      email: normalizedEmail,
      passwordHash,
      role: 'clinician'
    });
    await auditLogModel.create({
      userId: req.user.id,
      action: 'CREATE_CLINICIAN',
      targetTable: 'users',
      targetId: userId
    });

    return res.status(201).json({
      user: { id: userId, name: cleanClinicianName, email: normalizedEmail, role: 'clinician' }
    });
  } catch (err) {
    console.error('Create clinician error:', err);
    return res.status(500).json({ error: 'Unable to create clinician' });
  }
}

async function listClinicians(req, res) {
  try {
    return res.json(await userModel.findClinicians());
  } catch (err) {
    console.error('List clinicians error:', err);
    return res.status(500).json({ error: 'Unable to retrieve clinicians' });
  }
}

async function updateClinicianStatus(req, res, isActive) {
  try {
    const clinicianId = Number(req.params.id);
    if (!Number.isInteger(clinicianId) || clinicianId < 1) {
      return res.status(400).json({ error: 'Invalid clinician id' });
    }
    const updated = await userModel.setActiveStatus(clinicianId, isActive);
    if (!updated) return res.status(404).json({ error: 'Clinician not found' });
    await auditLogModel.create({
      userId: req.user.id,
      action: isActive ? 'REACTIVATE_CLINICIAN' : 'DEACTIVATE_CLINICIAN',
      targetTable: 'users',
      targetId: clinicianId
    });
    return res.json({ id: clinicianId, is_active: isActive });
  } catch (err) {
    console.error(`${isActive ? 'Reactivate' : 'Deactivate'} clinician error:`, err);
    return res.status(500).json({ error: `Unable to ${isActive ? 'reactivate' : 'deactivate'} clinician` });
  }
}

async function deactivateClinician(req, res) {
  return updateClinicianStatus(req, res, false);
}

async function reactivateClinician(req, res) {
  return updateClinicianStatus(req, res, true);
}

module.exports = { createClinician, deactivateClinician, listClinicians, reactivateClinician };