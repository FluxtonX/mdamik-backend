const User = require('../models/User');

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: req.user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const { fullName, phoneNumber } = req.body;

        const user = await User.findById(req.user._id);

        if (user) {
            user.fullName = fullName || user.fullName;
            user.phoneNumber = phoneNumber || user.phoneNumber;

            const updatedUser = await user.save();
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser,
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
};
