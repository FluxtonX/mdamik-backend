const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { protect, optionalProtect } = require('../middlewares/auth.middleware');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

const paginationValidators = [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
];

// Public routes (or protected if you prefer)
router.get('/materials', serviceController.getMaterials);
router.get('/professionals', serviceController.getProfessionals);
router.get('/providers', serviceController.getServiceProviders);
router.post('/providers/register',
    protect,
    [
        body('category').optional().isIn(['SiteService', 'Labor', 'Engineering', 'Excavation', 'Transport']).withMessage('Invalid category'),
        body('serviceType').isString().trim().isLength({ min: 2, max: 120 }).withMessage('serviceType is required'),
        body('skills').optional().isArray().withMessage('skills must be an array'),
        body('price.amount').isFloat({ min: 0 }).withMessage('price.amount must be 0 or greater'),
        body('price.currency').optional().isIn(['USD', 'SAR', 'SDG', 'EGP', 'THB']).withMessage('Unsupported currency'),
        body('price.unit').optional().isIn(['hour', 'day', 'job', 'm3', 'trip']).withMessage('Invalid price unit'),
        body('experienceYears').optional().isInt({ min: 0 }).withMessage('experienceYears must be 0 or greater'),
        body('status').optional().isIn(['AvailableNow', 'AvailableSoon', 'Busy', 'Inactive']).withMessage('Invalid status'),
    ],
    validate,
    serviceController.registerServiceProvider
);
router.get('/labor', serviceController.getLaborProviders);
router.get('/excavation/options', serviceController.getExcavationOptions);
router.post('/excavation/estimate',
    optionalProtect,
    [
        body('length').isFloat({ gt: 0 }).withMessage('length must be greater than 0'),
        body('width').isFloat({ gt: 0 }).withMessage('width must be greater than 0'),
        body('depth').isFloat({ gt: 0 }).withMessage('depth must be greater than 0'),
        body('excavationType').isString().notEmpty().withMessage('excavationType is required'),
        body('soilType').isString().notEmpty().withMessage('soilType is required'),
        body('projectId').optional().isMongoId().withMessage('projectId must be a valid Mongo ID'),
        body('persist').optional().isBoolean().withMessage('persist must be boolean'),
    ],
    validate,
    serviceController.createExcavationEstimate
);

router.get('/cart', protect, serviceController.getCart);
router.post('/cart/items',
    protect,
    [
        body('materialId').isMongoId().withMessage('materialId must be a valid Mongo ID'),
        body('quantity').optional().isFloat({ gt: 0 }).withMessage('quantity must be greater than 0'),
        body('projectId').optional().isMongoId().withMessage('projectId must be a valid Mongo ID'),
    ],
    validate,
    serviceController.addCartItem
);
router.patch('/cart/items/:itemId',
    protect,
    [
        param('itemId').isMongoId().withMessage('itemId must be a valid Mongo ID'),
        body('quantity').isFloat({ gt: 0 }).withMessage('quantity must be greater than 0'),
    ],
    validate,
    serviceController.updateCartItem
);
router.delete('/cart/items/:itemId',
    protect,
    [param('itemId').isMongoId().withMessage('itemId must be a valid Mongo ID')],
    validate,
    serviceController.removeCartItem
);
router.delete('/cart', protect, serviceController.clearCart);
router.post('/cart/checkout',
    protect,
    [
        body('projectId').optional().isMongoId().withMessage('projectId must be a valid Mongo ID'),
        body('currency').optional().isIn(['USD', 'SAR', 'SDG', 'EGP', 'THB']).withMessage('Unsupported currency'),
        body('deliveryFee').optional().isFloat({ min: 0 }).withMessage('deliveryFee must be 0 or greater'),
        body('clearAfterCheckout').optional().isBoolean().withMessage('clearAfterCheckout must be boolean'),
        body('deliveryAddress.fullName').optional().isString().trim().isLength({ max: 120 }),
        body('deliveryAddress.phone').optional().isString().trim().isLength({ max: 40 }),
        body('deliveryAddress.email').optional().isEmail().withMessage('deliveryAddress.email must be valid'),
        body('deliveryAddress.address').optional().isString().trim().isLength({ max: 500 }),
    ],
    validate,
    serviceController.checkoutCart
);
router.get('/material-orders', protect, paginationValidators, validate, serviceController.getMyMaterialOrders);

router.post('/hire',
    protect,
    [
        body('providerId').isMongoId().withMessage('providerId must be a valid Mongo ID'),
        body('projectId').optional().isMongoId().withMessage('projectId must be a valid Mongo ID'),
        body('scheduleType').optional().isIn(['OneTime', 'Recurring']).withMessage('Invalid scheduleType'),
        body('quantity.value').optional().isFloat({ gt: 0 }).withMessage('quantity.value must be greater than 0'),
    ],
    validate,
    serviceController.createHireRequest
);
router.get('/hire-requests', protect, paginationValidators, validate, serviceController.getMyHireRequests);

// Dev route
router.post('/seed', (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ success: false, message: 'Seed route is disabled in production' });
    }
    return serviceController.seedData(req, res, next);
});

module.exports = router;
