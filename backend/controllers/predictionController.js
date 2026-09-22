const axios = require('axios');
const patientModel = require('../models/patientModel');
const predictionModel = require('../models/predictionModel');
const auditLogModel = require('../models/auditLogModel');

const diabetesNumericFields = ['age', 'hypertension', 'heart_disease', 'bmi', 'HbA1c_level', 'blood_glucose_level'];
const diabetesCategoricalFields = ['gender', 'smoking_history'];
const heartFields = ['age', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo', 'cholesterol', 'gluc', 'smoke', 'alco', 'active'];

function validInput(inputData, condition) {
  if (!inputData || typeof inputData !== 'object' || Array.isArray(inputData)) return false;
  if (condition === 'diabetes') {
    const hasCategorical = diabetesCategoricalFields.every((f) => typeof inputData[f] === 'string' && inputData[f].trim().length > 0);
    const hasNumeric = diabetesNumericFields.every((f) => Object.prototype.hasOwnProperty.call(inputData, f) && Number.isFinite(Number(inputData[f])));
    return hasCategorical && hasNumeric;
  }
  if (condition === 'heart') {
    return heartFields.every((f) => Object.prototype.hasOwnProperty.call(inputData, f) && Number.isFinite(Number(inputData[f])));
  }
  return false;
}

async function resolvePatient(req, requestedId) {
  if (req.user.role === 'patient') return patientModel.findByUserId(req.user.id);
  const patientId = Number(requestedId);
  if (!Number.isInteger(patientId) || patientId < 1) return null;
  return patientModel.findById(patientId);
}

async function createPrediction(req, res, condition) {
  try {
    const { patientId, inputData } = req.body;
    if (!validInput(inputData, condition)) return res.status(400).json({ error: `inputData must include required fields for ${condition}` });
    const patient = await resolvePatient(req, patientId);
    if (!patient) return res.status(403).json({ error: 'A valid patient record is required' });

    const endpoint = `${process.env.ML_SERVICE_URL}/${condition === 'diabetes' ? 'predict/diabetes' : 'predict/heart'}`;
    const { data } = await axios.post(endpoint, inputData, { timeout: 10000 });
    const predictionId = await predictionModel.create({
      patientId: patient.id,
      predictionType: data.condition || (condition === 'heart' ? 'heart_disease' : condition),
      inputData,
      riskLabel: data.risk_label,
      riskProbability: data.risk_probability
    });
    await auditLogModel.create({ userId: req.user.id, action: 'CREATE_PREDICTION', targetTable: 'predictions', targetId: predictionId });
    return res.status(201).json({ id: predictionId, patientId: patient.id, ...data });
  } catch (err) {
    console.error('Create prediction error:', err);
    if (err.response) return res.status(502).json({ error: 'ML service rejected the prediction request' });
    return res.status(502).json({ error: 'Prediction service is unavailable' });
  }
}

async function history(req, res) {
  try {
    const patientId = Number(req.params.patientId);
    if (!Number.isInteger(patientId) || patientId < 1) return res.status(400).json({ error: 'Invalid patient id' });
    if (!await patientModel.findById(patientId)) return res.status(404).json({ error: 'Patient record not found' });
    return res.json(await predictionModel.findByPatientId(patientId));
  } catch (err) {
    console.error('Prediction history error:', err);
    return res.status(500).json({ error: 'Unable to retrieve prediction history' });
  }
}

async function symptomCheck(req, res) {
  try {
    const { symptoms } = req.body;
    if (!Array.isArray(symptoms) || symptoms.length === 0 || symptoms.some((symptom) => typeof symptom !== 'string')) {
      return res.status(400).json({ error: 'symptoms must be a non-empty array of strings' });
    }
    const patient = await patientModel.findByUserId(req.user.id);
    if (!patient) return res.status(403).json({ error: 'A valid patient record is required' });

    const { data } = await axios.post(`${process.env.ML_SERVICE_URL}/predict/symptom-check`, { symptoms }, { timeout: 10000 });
    const topPrediction = data.predictions?.[0];
    if (!topPrediction) return res.status(502).json({ error: 'ML service returned no symptom predictions' });

    let predictionId;
    try {
      predictionId = await predictionModel.create({
        patientId: patient.id,
        predictionType: 'symptom_check',
        inputData: { symptoms },
        riskLabel: topPrediction.disease,
        riskProbability: topPrediction.probability
      });
    } catch (err) {
      console.error('Symptom prediction database insert error:', err);
      throw err;
    }

    try {
      await auditLogModel.create({
        userId: req.user.id,
        action: 'CREATE_SYMPTOM_CHECK',
        targetTable: 'predictions',
        targetId: predictionId
      });
    } catch (err) {
      console.error('Symptom check audit log insert error:', err);
      throw err;
    }

    const topDisease = String(topPrediction.disease).toLowerCase();
    let suggestedFollowUp = null;
    if (topDisease.includes('diabetes')) {
      suggestedFollowUp = 'Consider a diabetes risk prediction assessment.';
    } else if (topDisease.includes('heart')) {
      suggestedFollowUp = 'Consider a heart disease risk prediction assessment.';
    }

    return res.json({ ...data, id: predictionId, patientId: patient.id, suggestedFollowUp });
  } catch (err) {
    console.error('Symptom check error:', err);
    if (err.response) return res.status(502).json({ error: 'ML service rejected the symptom check request' });
    if (err.code && err.code.startsWith('ER_')) return res.status(500).json({ error: 'Unable to save symptom check' });
    return res.status(502).json({ error: 'Prediction service is unavailable' });
  }
}

async function listSymptoms(req, res) {
  try {
    const { data } = await axios.get(`${process.env.ML_SERVICE_URL}/symptoms`, { timeout: 10000 });
    return res.json(data);
  } catch (err) {
    console.error('List symptoms error:', err);
    return res.status(502).json({ error: 'Prediction service is unavailable' });
  }
}

module.exports = { createPrediction, history, listSymptoms, symptomCheck };