const User = require('../models/User');

const getInitials = (name = '') => name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'U';

const withUserUi = (userDoc) => {
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
    const verification = user.verification || {};
    const completed = verification.progress || ['phone', 'email', 'nationalId', 'business']
        .filter((field) => verification[field]).length;
    const joined = user.createdAt ? new Date(user.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' }) : '';

    return {
        ...user,
        ui: {
            initials: getInitials(user.fullName),
            name: user.fullName,
            email: user.email,
            phone: user.phoneNumber,
            location: user.location,
            role: user.profileRole,
            memberSince: `Client - Member since ${joined}`,
            verificationCompleted: completed,
            verificationTotal: 6,
            verificationLabel: `${completed}/6 Completed`,
            verificationProgress: completed / 6,
        },
    };
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: withUserUi(req.user),
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
        const { fullName, phoneNumber, location, profileRole, avatar } = req.body;
        const user = req.user;

        user.fullName = fullName || user.fullName;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.location = location !== undefined ? location : user.location;
        user.profileRole = profileRole || user.profileRole;
        user.avatar = avatar !== undefined ? avatar : user.avatar;

        const updatedUser = await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: withUserUi(updatedUser),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user preferences (language, region, theme)
 */
const updatePreferences = async (req, res, next) => {
    try {
        const { language, region, theme } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            if (!user.preferences) user.preferences = {};
            
            if (language) user.preferences.language = language;
            if (region) user.preferences.region = region;
            if (theme) user.preferences.theme = theme;

            await user.save();
            res.status(200).json({
                success: true,
                message: 'Preferences updated successfully',
                data: user.preferences,
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

const updateSecuritySettings = async (req, res, next) => {
    try {
        const { twoFactorEnabled, twoFactorMethod } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.security) user.security = {};
        if (twoFactorEnabled !== undefined) user.security.twoFactorEnabled = twoFactorEnabled;
        if (twoFactorMethod) user.security.twoFactorMethod = twoFactorMethod;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Security settings updated successfully',
            data: user.security,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updatePreferences,
    updateSecuritySettings,
};
