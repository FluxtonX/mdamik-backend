const User = require('../models/User');

/**
 * Register a new user in the database
 * Usually called after the frontend has successfully registered the user with Firebase
 */
const register = async (req, res, next) => {
    try {
        const { fullName, email, phoneNumber, firebaseUid } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { firebaseUid }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }

        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            firebaseUid,
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: newUser,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get or verify user login
 */
const login = async (req, res, next) => {
    try {
        const { firebaseUid } = req.body;

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found in database',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User verified successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Send OTP to phone number
 */
const sendOtp = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // In a real scenario, you would call an SMS service here (e.g. Twilio)
        console.log(`Sending OTP ${otp} to ${phoneNumber}`);

        const Otp = require('../models/Otp');
        await Otp.findOneAndUpdate(
            { phoneNumber },
            { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully (Check console for code in dev)',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify OTP
 */
const verifyOtp = async (req, res, next) => {
    try {
        const { phoneNumber, otp } = req.body;

        const Otp = require('../models/Otp');
        const otpRecord = await Otp.findOne({ phoneNumber, otp });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
            });
        }

        // Delete OTP record after successful verification
        await Otp.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    sendOtp,
    verifyOtp,
};
