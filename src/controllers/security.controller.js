const Session = require('../models/Session');
const User = require('../models/User');

const getRelativeTime = (date) => {
    const seconds = Math.max(Math.floor((Date.now() - new Date(date).getTime()) / 1000), 0);
    if (seconds < 60) return 'Active now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
};

const withSessionUi = (sessionDoc) => {
    const session = sessionDoc.toObject ? sessionDoc.toObject() : sessionDoc;
    const location = session.device && session.device.location ? session.device.location : 'Unknown location';
    return {
        ...session,
        ui: {
            name: session.device && session.device.name ? session.device.name : 'Unknown Device',
            details: `${location} - ${getRelativeTime(session.lastActive)}`,
            isActive: session.isActive,
            os: session.device && session.device.os,
        },
    };
};

/**
 * Get active sessions for the current user
 */
const getSessions = async (req, res, next) => {
    try {
        const sessions = await Session.find({ userId: req.user._id, isActive: true })
            .sort({ lastActive: -1 });

        res.status(200).json({
            success: true,
            data: sessions.map(withSessionUi)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Revoke a specific session
 */
const revokeSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findOneAndUpdate(
            { _id: sessionId, userId: req.user._id },
            { isActive: false },
            { returnDocument: 'after' }
        );

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Session revoked successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update verification status
 */
const updateVerification = async (req, res, next) => {
    try {
        const { type, status } = req.body; // type: phone, email, nationalId, business
        
        const user = await User.findById(req.user._id);
        if (!user.verification) user.verification = { progress: 0 };
        
        user.verification[type] = status;
        
        // Recalculate progress
        const fields = ['phone', 'email', 'nationalId', 'business'];
        const completed = fields.filter(f => user.verification[f]).length;
        user.verification.progress = completed;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Verification updated',
            data: user.verification
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSessions,
    revokeSession,
    updateVerification
};
