const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

/**
 * @route   GET /api/payments/currencies
 * @desc    Get all supported currencies
 * @access  Public
 */
router.get('/currencies', paymentController.getSupportedCurrencies);

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate a payment for a transaction
 * @access  Private
 */
router.post('/initiate',
    protect,
    [
        body('transactionId').isMongoId().withMessage('Valid transaction ID is required'),
        body('gateway')
            .isIn(['Stripe', 'MyFawry', 'BangkokBank', 'COD'])
            .withMessage('Valid payment gateway is required: Stripe, MyFawry, BangkokBank, COD'),
        body('currency')
            .optional()
            .isIn(['USD', 'SAR', 'SDG', 'EGP', 'THB'])
            .withMessage('Valid currency required: USD, SAR, SDG, EGP, THB'),
    ],
    validate,
    paymentController.initiatePayment
);

/**
 * @route   POST /api/payments/checkout/session
 * @desc    Create a Stripe Checkout Session (web checkout page)
 * @access  Private
 */
router.post('/checkout/session',
    protect,
    [
        body('transactionId').isMongoId().withMessage('Valid transaction ID is required'),
        body('currency')
            .optional()
            .isIn(['USD', 'SAR', 'EGP', 'THB'])
            .withMessage('Valid Stripe currency required: USD, SAR, EGP, THB'),
        body('successUrl').optional().isURL().withMessage('successUrl must be a valid URL'),
        body('cancelUrl').optional().isURL().withMessage('cancelUrl must be a valid URL'),
    ],
    validate,
    paymentController.createCheckoutSession
);

/**
 * @route   POST /api/payments/cod/confirm/:transactionId
 * @desc    Confirm a Cash on Delivery payment as completed
 * @access  Private
 */
router.post('/cod/confirm/:transactionId',
    protect,
    [
        param('transactionId').isMongoId().withMessage('Valid transaction ID is required'),
    ],
    validate,
    paymentController.confirmCODPayment
);

/**
 * @route   POST /api/payments/webhook/stripe
 * @desc    Stripe webhook — handled in app.js (before express.json) for raw body
 * @access  Public
 */
// NOTE: Registered in app.js directly for raw body access

/**
 * @route   POST /api/payments/webhook/fawry
 * @desc    Fawry webhook handler
 * @access  Public
 */
router.post('/webhook/fawry', paymentController.fawryWebhook);

/**
 * @route   POST /api/payments/webhook/bangkokbank
 * @desc    Bangkok Bank webhook handler
 * @access  Public
 */
router.post('/webhook/bangkokbank', paymentController.bangkokBankWebhook);

module.exports = router;
