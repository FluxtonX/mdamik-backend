const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
const crypto = require('crypto');

/**
 * Supported currencies
 * SDG = Sudanese Pound, USD = US Dollar, SAR = Saudi Riyal
 * NOTE: Stripe does not support SDG natively. For SDG payments, use Fawry or COD.
 */
const SUPPORTED_CURRENCIES = {
    USD: { code: 'usd', name: 'US Dollar',       symbol: '$',  stripeSupported: true  },
    SAR: { code: 'sar', name: 'Saudi Riyal',      symbol: '﷼', stripeSupported: true  },
    SDG: { code: 'sdg', name: 'Sudanese Pound',   symbol: 'ج.س', stripeSupported: false },
    EGP: { code: 'egp', name: 'Egyptian Pound',   symbol: 'E£', stripeSupported: true  },
    THB: { code: 'thb', name: 'Thai Baht',        symbol: '฿', stripeSupported: true  },
};

/**
 * Validate that a currency code is supported
 */
const validateCurrency = (currencyCode) => {
    const upper = currencyCode.toUpperCase();
    if (!SUPPORTED_CURRENCIES[upper]) {
        throw new Error(`Unsupported currency: ${currencyCode}. Supported: ${Object.keys(SUPPORTED_CURRENCIES).join(', ')}`);
    }
    return SUPPORTED_CURRENCIES[upper];
};

/**
 * Stripe Payment Intent Creation
 */
const createStripePaymentIntent = async (amount, currencyCode, metadata) => {
    const currency = validateCurrency(currencyCode);
    if (!currency.stripeSupported) {
        throw new Error(`Currency ${currencyCode} is not supported by Stripe. Please use MyFawry or COD for this currency.`);
    }
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amounts in smallest unit (cents/halalas)
            currency: currency.code,
            metadata,
            automatic_payment_methods: { enabled: true },
        });
        return {
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
            status: paymentIntent.status,
            currency: currency.code,
        };
    } catch (error) {
        throw new Error(`Stripe Error: ${error.message}`);
    }
};

/**
 * Stripe Checkout Session (for web-based checkout pages)
 */
const createStripeCheckoutSession = async ({ amount, currencyCode, projectId, transactionId, successUrl, cancelUrl }) => {
    const currency = validateCurrency(currencyCode);
    if (!currency.stripeSupported) {
        throw new Error(`Currency ${currencyCode} is not supported by Stripe.`);
    }
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: currency.code,
                    product_data: { name: 'Mdamik Project Payment' },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: successUrl || `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment-cancel`,
            metadata: { transactionId, projectId },
        });
        return {
            sessionId: session.id,
            sessionUrl: session.url,
            currency: currency.code,
        };
    } catch (error) {
        throw new Error(`Stripe Checkout Error: ${error.message}`);
    }
};

/**
 * MyFawry Payment Placeholder
 * TODO: Replace with actual MyFawry API integration
 * Supports: SDG, EGP
 */
const createFawryPayment = async (amount, currencyCode, metadata) => {
    const currency = validateCurrency(currencyCode);
    const referenceId = `FAWRY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    // Production: POST to https://www.atfawry.com/ECommercePlugin/api/payment/create
    // with merchant credentials and signature
    const signatureData = `${process.env.FAWRY_MERCHANT_CODE || 'MERCHANT'}${referenceId}${amount}${process.env.FAWRY_SECRET_KEY || 'FAWRY_SECRET'}`;
    const signature = crypto.createHash('sha256').update(signatureData).digest('hex');

    return {
        paymentUrl: `https://sandbox.fawry.com/pay/${referenceId}`,
        referenceId,
        signature,
        amount,
        currency: currency.code,
        message: 'Fawry payment initiated (Sandbox Mode)',
    };
};

/**
 * Bangkok Bank Payment Placeholder
 * TODO: Replace with actual Bangkok Bank API integration
 * Supports: THB, USD
 */
const createBangkokBankPayment = async (amount, currencyCode, metadata) => {
    const currency = validateCurrency(currencyCode);
    const referenceId = `BKB-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Production: POST to Bangkok Bank's Bualuang mBanking / iBanking API
    const signatureData = `${process.env.BANGKOK_BANK_MERCHANT_ID || 'MERCHANT'}${referenceId}${amount}${process.env.BANGKOK_BANK_SECRET || 'BKB_SECRET'}`;
    const signature = crypto.createHash('sha256').update(signatureData).digest('hex');

    return {
        paymentUrl: `https://sandbox.bangkokbank.com/pay/${referenceId}`,
        referenceId,
        signature,
        amount,
        currency: currency.code,
        message: 'Bangkok Bank payment initiated (Sandbox Mode)',
    };
};

/**
 * Verify Stripe Webhook Signature
 */
const verifyStripeWebhook = (payload, signature, secret) => {
    if (!secret) throw new Error('Stripe webhook secret not configured');
    try {
        const event = stripe.webhooks.constructEvent(payload, signature, secret);
        return event;
    } catch (err) {
        throw new Error(`Stripe Webhook Verification Failed: ${err.message}`);
    }
};

/**
 * Verify Fawry Webhook Signature (HMAC-SHA256)
 */
const verifyFawryWebhook = (payload, signature) => {
    const secret = process.env.FAWRY_WEBHOOK_SECRET;
    if (!secret) throw new Error('Fawry webhook secret not configured');
    if (!signature) throw new Error('Fawry Webhook Error: Missing signature header');
    const expectedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        throw new Error('Fawry Webhook Error: Invalid signature');
    }
    return true;
};

/**
 * Verify Bangkok Bank Webhook Signature (HMAC-SHA256)
 */
const verifyBangkokBankWebhook = (payload, signature) => {
    const secret = process.env.BANGKOK_BANK_WEBHOOK_SECRET;
    if (!secret) throw new Error('Bangkok Bank webhook secret not configured');
    if (!signature) throw new Error('Bangkok Bank Webhook Error: Missing signature header');
    const expectedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        throw new Error('Bangkok Bank Webhook Error: Invalid signature');
    }
    return true;
};

module.exports = {
    SUPPORTED_CURRENCIES,
    validateCurrency,
    createStripePaymentIntent,
    createStripeCheckoutSession,
    createFawryPayment,
    createBangkokBankPayment,
    verifyStripeWebhook,
    verifyFawryWebhook,
    verifyBangkokBankWebhook,
};
