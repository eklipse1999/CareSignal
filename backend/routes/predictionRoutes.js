const express = require('express');
const controller = require('../controllers/predictionController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.post('/diabetes', authenticate, requireRole('patient', 'admin'), (req, res) => controller.createPrediction(req, res, 'diabetes'));
router.post('/heart', authenticate, requireRole('patient', 'admin'), (req, res) => controller.createPrediction(req, res, 'heart'));
router.post('/symptom-check', authenticate, requireRole('patient'), controller.symptomCheck);
router.get('/:patientId', authenticate, requireRole('clinician', 'admin'), controller.history);

module.exports = router;