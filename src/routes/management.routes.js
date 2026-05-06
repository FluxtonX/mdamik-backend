const express = require('express');
const router = express.Router();
const managementController = require('../controllers/management.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/stats', managementController.getManagementStats);
router.get('/projects', managementController.getManagementProjects);

module.exports = router;
