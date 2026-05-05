const { validationResult } = require('express-validator');

/**
 * Middleware to check for validation errors from express-validator
 * If errors exist, it responds with a 400 status and the error details.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: errors.array(),
        });
    }
    next();
};

module.exports = {
    validate,
};
