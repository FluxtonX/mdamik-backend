const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

// All routes here are protected
router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile',
    [
        body('fullName').optional().isString().trim().isLength({ min: 2, max: 120 }).withMessage('fullName must be 2-120 characters'),
        body('phoneNumber').optional().isString().trim().isLength({ max: 40 }).withMessage('phoneNumber is too long'),
        body('profileRole').optional().isIn(['Client / Owner', 'Contractor', 'Worker / Freelancer', 'Engineer / Consultant', 'Supplier']).withMessage('Invalid profileRole'),
        body('location').optional().isString().trim().isLength({ max: 120 }).withMessage('location is too long'),
    ],
    validate,
    userController.updateProfile
);
router.patch('/preferences',
    [
        body('language').optional().isIn(['en', 'ar']).withMessage('language must be en or ar'),
        body('theme').optional().isIn(['light', 'dark']).withMessage('theme must be light or dark'),
        body('region').optional().isString().trim().isLength({ max: 120 }).withMessage('region is too long'),
    ],
    validate,
    userController.updatePreferences
);
router.patch('/security-settings',
    [
        body('twoFactorEnabled').optional().isBoolean().withMessage('twoFactorEnabled must be boolean'),
        body('twoFactorMethod').optional().isIn(['SMS', 'Email']).withMessage('twoFactorMethod must be SMS or Email'),
    ],
    validate,
    userController.updateSecuritySettings
);

module.exports = router;
