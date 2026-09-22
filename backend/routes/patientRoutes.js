const express = require('express');
const controller = require('../controllers/patientController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.get('/me', authenticate, requireRole('patient'), controller.getOwn);
router.get('/', authenticate, requireRole('clinician', 'admin'), controller.list);
router.get('/:id', authenticate, requireRole('patient', 'clinician', 'admin'), controller.getById);
router.patch('/:id', authenticate, requireRole('patient', 'admin'), controller.update);

module.exports = router;