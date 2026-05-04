const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { protect } = require('../middlewares/auth.middleware');

// Public routes (or protected if you prefer)
router.get('/materials', serviceController.getMaterials);
router.get('/professionals', serviceController.getProfessionals);

// Dev route
router.post('/seed', serviceController.seedData);

module.exports = router;
