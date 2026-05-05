const paymentService = require('../services/payment.service');
const Transaction = require('../models/Transaction');
const { cache } = require('../utils/cache');

/**
 * GET /api/payments/currencies
 * Returns all supported currencies
 * Cached for 1 hour
 */
const getSupportedCurrencies = (req, res) => {
    const cacheKey = 'supported_currencies';
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.status(200).json(cachedData);
    }

    const response = {
        success: true,
        data: paymentService.SUPPORTED_CURRENCIES,
    };

    cache.set(cacheKey, response);
    res.status(200).json(response);
};

/**
 * POST /api/payments/initiate
 * Initiate a payment via gateway (Stripe, MyFawry, BangkokBank, COD)
 * Body: { transactionId, gateway, currency }
 */
const initiatePayment = async (req, res, next) => {
    try {
        const { transactionId, gateway, currency = 'USD' } = req.body;

        // Validate currency
        paymentService.validateCurrency(currency);

        const transaction = await Transaction.findOne({ _id: transactionId, userId: req.user._id });
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        if (!['Pending', 'Failed'].includes(transaction.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot initiate payment. Current status: ${transaction.status}`,
            });
        }

        let paymentData;
        switch (gateway) {
            case 'Stripe':
                paymentData = await paymentService.createStripePaymentIntent(
                    transaction.amount, currency, { transactionId: transaction._id.toString() }
                );
                transaction.referenceId = paymentData.id;
                break;
            case 'MyFawry':
                paymentData = await paymentService.createFawryPayment(
                    transaction.amount, currency, { transactionId: transaction._id.toString() }
                );
                transaction.referenceId = paymentData.referenceId;
                break;
            case 'BangkokBank':
                paymentData = await paymentService.createBangkokBankPayment(
                    transaction.amount, currency, { transactionId: transaction._id.toString() }
                );
                transaction.referenceId = paymentData.referenceId;
                break;
            case 'COD':
                transaction.paymentGateway = 'COD';
                transaction.status = 'Processing';
                await transaction.save();
                return res.status(200).json({
                    success: true,
                    message: 'Cash on Delivery payment initiated. Awaiting delivery confirmation.',
                    data: { method: 'COD', instructions: 'Pay cash upon delivery. Reference your order ID.' },
                    transaction,
                });
            default:
                return res.status(400).json({ success: false, message: 'Unsupported payment gateway' });
        }

        transaction.paymentGateway = gateway;
        await transaction.save();

        res.status(200).json({ success: true, data: paymentData, transaction });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/payments/checkout/session
 * Create a Stripe Checkout Session for web-based payment pages
 * Body: { transactionId, currency, successUrl, cancelUrl }
 */
const createCheckoutSession = async (req, res, next) => {
    try {
        const { transactionId, currency = 'USD', successUrl, cancelUrl } = req.body;

        const transaction = await Transaction.findOne({ _id: transactionId, userId: req.user._id });
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        if (!['Pending', 'Failed'].includes(transaction.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot create checkout. Current status: ${transaction.status}`,
            });
        }

        const sessionData = await paymentService.createStripeCheckoutSession({
            amount: transaction.amount,
            currencyCode: currency,
            projectId: transaction.projectId.toString(),
            transactionId: transaction._id.toString(),
            successUrl,
            cancelUrl,
        });

        transaction.referenceId = sessionData.sessionId;
        transaction.paymentGateway = 'Stripe';
        await transaction.save();

        res.status(200).json({ success: true, data: sessionData, transaction });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/payments/cod/confirm/:transactionId
 * Manually confirm a COD payment (admin or delivery agent marks as completed)
 */
const confirmCODPayment = async (req, res, next) => {
    try {
        const { transactionId } = req.params;
        const transaction = await Transaction.findOne({ _id: transactionId, userId: req.user._id });
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        if (transaction.paymentGateway !== 'COD') {
            return res.status(400).json({ success: false, message: 'This transaction is not a COD payment' });
        }
        if (transaction.status !== 'Processing') {
            return res.status(400).json({
                success: false,
                message: `COD can only be confirmed when Processing. Current: ${transaction.status}`,
            });
        }
        transaction.status = 'Completed';
        await transaction.save();
        res.status(200).json({ success: true, message: 'COD payment confirmed as completed', transaction });
    } catch (error) {
        next(error);
    }
};

/**
 * Stripe Webhook Handler
 * Mounted BEFORE express.json() in app.js to receive raw body
 */
const stripeWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        event = paymentService.verifyStripeWebhook(req.body, signature, endpointSecret || 'whsec_mock');
    } catch (err) {
        console.error('[Stripe Webhook] Signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const pi = event.data.object;
                const txId = pi.metadata.transactionId;
                if (txId) {
                    const tx = await Transaction.findById(txId);
                    if (tx && tx.status === 'Processing') {
                        tx.status = 'Completed';
                        await tx.save();
                    }
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const pi = event.data.object;
                const txId = pi.metadata.transactionId;
                if (txId) {
                    const tx = await Transaction.findById(txId);
                    if (tx) {
                        tx.status = 'Failed';
                        await tx.save();
                    }
                }
                break;
            }
            case 'checkout.session.completed': {
                const session = event.data.object;
                const txId = session.metadata.transactionId;
                if (txId) {
                    const tx = await Transaction.findById(txId);
                    if (tx) {
                        tx.status = 'Completed';
                        await tx.save();
                    }
                }
                break;
            }
            case 'charge.refunded': {
                const charge = event.data.object;
                const txId = charge.metadata ? charge.metadata.transactionId : null;
                if (txId) {
                    const tx = await Transaction.findById(txId);
                    if (tx) {
                        tx.status = 'Refunded';
                        await tx.save();
                    }
                }
                break;
            }
            default:
                console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
        res.status(200).json({ received: true });
    } catch (err) {
        console.error('[Stripe Webhook] Handler error:', err.message);
        res.status(500).send('Internal server error processing webhook');
    }
};

/**
 * Fawry Webhook Handler
 */
const fawryWebhook = async (req, res) => {
    const signature = req.headers['x-fawry-signature'];
    try {
        paymentService.verifyFawryWebhook(req.body, signature);
        const { referenceId, status } = req.body;
        const transaction = await Transaction.findOne({ referenceId });
        if (transaction) {
            if (status === 'PAID') transaction.status = 'Completed';
            else if (status === 'FAILED') transaction.status = 'Failed';
            await transaction.save();
        }
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('[Fawry Webhook]', error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};

/**
 * Bangkok Bank Webhook Handler
 */
const bangkokBankWebhook = async (req, res) => {
    const signature = req.headers['x-bkb-signature'];
    try {
        paymentService.verifyBangkokBankWebhook(req.body, signature);
        const { referenceId, status } = req.body;
        const transaction = await Transaction.findOne({ referenceId });
        if (transaction) {
            if (status === 'SUCCESS') transaction.status = 'Completed';
            else if (status === 'FAILED') transaction.status = 'Failed';
            await transaction.save();
        }
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('[Bangkok Bank Webhook]', error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};

module.exports = {
    getSupportedCurrencies,
    initiatePayment,
    createCheckoutSession,
    confirmCODPayment,
    stripeWebhook,
    fawryWebhook,
    bangkokBankWebhook,
};
