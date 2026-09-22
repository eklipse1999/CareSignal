const express = require('express');
const controller = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.post('/clinicians', authenticate, requireRole('admin'), controller.createClinician);
router.get('/clinicians', authenticate, requireRole('admin'), controller.listClinicians);
router.patch('/clinicians/:id/deactivate', authenticate, requireRole('admin'), controller.deactivateClinician);
router.patch('/clinicians/:id/reactivate', authenticate, requireRole('admin'), controller.reactivateClinician);

module.exports = router;
