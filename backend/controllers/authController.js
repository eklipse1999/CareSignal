const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const patientModel = require('../models/patientModel');
const auditLogModel = require('../models/auditLogModel');
const { cleanName, passwordPolicyError } = require('../utils/validation');

function tokenFor(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function register(req, res) {
  try {
    const { name, email, password, dateOfBirth, phone } = req.body;
    const role = 'patient';
    if (typeof name !== 'string' || name.trim().length < 2 ||
        typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) ||
        typeof password !== 'string' ||
        (dateOfBirth !== undefined && typeof dateOfBirth !== 'string') ||
        (phone !== undefined && typeof phone !== 'string') ||
        role !== 'patient') {
      return res.status(400).json({ error: 'Valid name, email, and password (8+ characters) are required' });
    }

    const policyError = passwordPolicyError(password, name, email);
    if (policyError) return res.status(400).json({ error: policyError });

    const cleanUserName = cleanName(name);
    const normalizedEmail = email.trim().toLowerCase();
    if (await userModel.findByEmail(normalizedEmail)) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await userModel.create({ name: cleanUserName, email: normalizedEmail, passwordHash, role });
    let patientId;
    if (role === 'patient') {
      patientId = await patientModel.create({ userId, dateOfBirth, phone });
    }

    const user = { id: userId, name: cleanUserName, email: normalizedEmail, role };
    return res.status(201).json({ token: tokenFor(user), user: { ...publicUser(user), patientId } });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Unable to register user' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findByEmail(normalizedEmail);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      try {
        await auditLogModel.create({ userId: user?.id || null, action: 'FAILED_LOGIN', targetTable: 'users', targetId: user?.id || null });
      } catch (auditError) {
        console.error('Failed login audit error:', auditError);
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!user.is_active) return res.status(403).json({ error: 'This account has been deactivated' });
    const patient = user.role === 'patient' ? await patientModel.findByUserId(user.id) : null;
    return res.json({ token: tokenFor(user), user: { ...publicUser(user), patientId: patient?.id } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Unable to log in' });
  }
}

module.exports = { register, login };