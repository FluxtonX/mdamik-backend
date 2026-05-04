const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { protect } = require('../middlewares/auth.middleware');

// All project routes require authentication
router.use(protect);

router.post('/', projectController.createProject);
router.get('/', projectController.getMyProjects);
router.get('/:id', projectController.getProjectById);
router.patch('/:id/status', projectController.updateProjectStatus);

module.exports = router;
