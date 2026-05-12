const express = require('express');
const router = express.Router();
const managementController = require('../controllers/management.controller');
const { protect } = require('../middlewares/auth.middleware');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

router.use(protect);

router.get('/stats', managementController.getManagementStats);
router.get('/projects',
    [
        query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
    ],
    validate,
    managementController.getManagementProjects
);
router.get('/projects/:id',
    [param('id').isMongoId().withMessage('Project ID must be valid')],
    validate,
    managementController.getManagementProjectDetails
);
router.post('/projects/:id/team',
    [
        param('id').isMongoId().withMessage('Project ID must be valid'),
        body('name').isString().trim().isLength({ min: 2, max: 120 }).withMessage('name is required'),
        body('role').isString().trim().isLength({ min: 2, max: 120 }).withMessage('role is required'),
        body('email').optional().isEmail().withMessage('email must be valid'),
        body('status').optional().isIn(['Active', 'Invited', 'Inactive']).withMessage('Invalid status'),
    ],
    validate,
    managementController.addTeamMember
);
router.post('/projects/:id/actions',
    [
        param('id').isMongoId().withMessage('Project ID must be valid'),
        body('title').isString().trim().isLength({ min: 2, max: 160 }).withMessage('title is required'),
        body('type').optional().isIn(['Approval', 'Payment', 'Material', 'Inspection', 'General']).withMessage('Invalid action type'),
        body('dueDate').optional().isISO8601().withMessage('dueDate must be ISO8601'),
    ],
    validate,
    managementController.createProjectAction
);
router.patch('/projects/:id/actions/:actionId',
    [
        param('id').isMongoId().withMessage('Project ID must be valid'),
        param('actionId').isMongoId().withMessage('Action ID must be valid'),
        body('status').optional().isIn(['Pending', 'Resolved', 'Dismissed']).withMessage('Invalid status'),
    ],
    validate,
    managementController.resolveProjectAction
);

module.exports = router;
