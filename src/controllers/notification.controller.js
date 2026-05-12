const Notification = require('../models/Notification');

const typeIconMap = {
    Chat: 'chat_bubble_outline',
    Project: 'access_time',
    Financial: 'check_circle_outline',
    System: 'info_outline',
    Offer: 'local_offer_outlined',
    Support: 'help_outline',
};

const getRelativeTime = (date) => {
    const seconds = Math.max(Math.floor((Date.now() - new Date(date).getTime()) / 1000), 0);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
};

const withNotificationUi = (notificationDoc) => {
    const notification = notificationDoc.toObject ? notificationDoc.toObject() : notificationDoc;
    return {
        ...notification,
        ui: {
            title: notification.title,
            desc: notification.message,
            time: getRelativeTime(notification.createdAt),
            icon: typeIconMap[notification.type] || typeIconMap.System,
            isImportant: notification.priority === 'High',
            hasUnread: !notification.isRead,
        },
    };
};

/**
 * Get all notifications for current user
 */
const getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { recipient: req.user._id };
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);

        res.status(200).json({
            success: true,
            data: notifications.map(withNotificationUi),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
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
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { returnDocument: 'after' }
        );
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: withNotificationUi(notification),
        });
    } catch (error) {
        next(error);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        const result = await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            data: { modifiedCount: result.modifiedCount },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
};
