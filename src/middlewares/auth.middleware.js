// Mock Auth Middleware
// In production, this would use firebase-admin to verify the ID token
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token',
            });
        }

        // MOCK: In real app, verify firebase token and get UID
        // For now, we expect the token to be the firebaseUid for testing
        const firebaseUid = token; 

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user not found',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authorized, token failed',
        });
    }
};

const optionalProtect = async (req, res, next) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
            return next();
        }

        const token = req.headers.authorization.split(' ')[1];
        const user = await User.findOne({ firebaseUid: token });
        if (user) {
            req.user = user;
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { protect, optionalProtect };
