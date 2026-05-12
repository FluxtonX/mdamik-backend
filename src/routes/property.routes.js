const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { protect, optionalProtect } = require('../middlewares/auth.middleware');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

const propertyIdValidator = [param('id').isMongoId().withMessage('Property ID must be valid')];

// Public listing
router.get('/',
    optionalProtect,
    [
        query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be 0 or greater'),
        query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be 0 or greater'),
        query('bedrooms').optional().isIn(['1', '2', '3', '4', '4+']).withMessage('bedrooms must be 1, 2, 3, 4, or 4+'),
        query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
    ],
    validate,
    propertyController.getProperties
);
router.get('/favorites', protect, propertyController.getFavoriteProperties);
router.get('/inquiries', protect, propertyController.getMyInquiries);
router.get('/:id', optionalProtect, propertyIdValidator, validate, propertyController.getPropertyById);

// Protected listing (requires login to list property)
router.post('/',
    protect,
    [
        body('title').isString().trim().isLength({ min: 2, max: 160 }).withMessage('title is required'),
        body('price').isFloat({ min: 0 }).withMessage('price must be 0 or greater'),
        body('location').isString().trim().notEmpty().withMessage('location is required'),
        body('category').isIn(['Apartment', 'Villa', 'Land', 'Office', 'House']).withMessage('Invalid category'),
        body('type').isIn(['Buy', 'Sell', 'Rent']).withMessage('Invalid property type'),
        body('bedrooms').optional().isInt({ min: 0 }).withMessage('bedrooms must be 0 or greater'),
        body('bathrooms').optional().isInt({ min: 0 }).withMessage('bathrooms must be 0 or greater'),
        body('area.value').optional().isFloat({ min: 0 }).withMessage('area.value must be 0 or greater'),
        body('area.unit').optional().isIn(['sqft', 'sqm']).withMessage('area.unit must be sqft or sqm'),
        body('images').optional().isArray().withMessage('images must be an array'),
        body('features').optional().isArray().withMessage('features must be an array'),
    ],
    validate,
    propertyController.listProperty
);
router.post('/:id/favorite', protect, propertyIdValidator, validate, propertyController.toggleFavorite);
router.post('/:id/inquiries',
    protect,
    [
        param('id').isMongoId().withMessage('Property ID must be valid'),
        body('type').isIn(['Tour', 'Offer', 'Message', 'CallRequest']).withMessage('Invalid inquiry type'),
        body('offeredPrice').optional().isFloat({ min: 0 }).withMessage('offeredPrice must be 0 or greater'),
        body('preferredDate').optional().isISO8601().withMessage('preferredDate must be ISO8601'),
        body('message').optional().isString().trim().isLength({ max: 1000 }).withMessage('message is too long'),
    ],
    validate,
    propertyController.createInquiry
);

module.exports = router;
