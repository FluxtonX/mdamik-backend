const Session = require('../models/Session');
const User = require('../models/User');

/**
 * Get active sessions for the current user
 */
const getSessions = async (req, res, next) => {
    try {
        const sessions = await Session.find({ userId: req.user._id, isActive: true })
            .sort({ lastActive: -1 });

        res.status(200).json({
            success: true,
            data: sessions
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
            { new: true }
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
