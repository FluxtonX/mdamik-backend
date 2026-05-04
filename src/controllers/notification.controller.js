const Notification = require('../models/Notification');

/**
 * Get all notifications for current user
 */
const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res, next) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
};
