const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
// Stripe Webhook needs raw body
const paymentController = require('./controllers/payment.controller');
app.post('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`,
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Duplicate record',
            fields: Object.keys(err.keyPattern || {}),
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map((item) => ({
                field: item.path,
                message: item.message,
            })),
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;
