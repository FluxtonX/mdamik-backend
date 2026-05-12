const Message = require('../models/Message');
const {
    createChatMessage,
    getInitials,
    getRelativeTime,
    markConversationReadByUsers,
    withMessageUi,
} = require('../services/chat.service');

/**
 * Get messages between two users
 */
const getMessages = async (req, res, next) => {
    try {
        const { otherUserId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {
            $or: [
                { sender: req.user._id, recipient: otherUserId },
                { sender: otherUserId, recipient: req.user._id }
            ]
        };

        const messages = await Message.find(query)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Message.countDocuments(query);
        await Message.updateMany(
            { sender: otherUserId, recipient: req.user._id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.status(200).json({
            success: true,
            data: messages.map((message) => withMessageUi(message, req.user._id)),
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
 * Send a new message
 */
const sendMessage = async (req, res, next) => {
    try {
        const { recipient, content } = req.body;
        const { message, notification } = await createChatMessage({
            senderId: req.user._id,
            recipientId: recipient,
            content,
        });
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${recipient}`).emit('message:new', {
                message: withMessageUi(message, recipient),
            });
            io.to(`user:${recipient}`).emit('notification:new', notification);
        }

        res.status(201).json({
            success: true,
            data: withMessageUi(message, req.user._id),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get conversation list (distinct users I've chatted with)
 */
const getConversations = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const conversations = await Message.aggregate([
            { $match: { $or: [{ sender: userId }, { recipient: userId }] } },
            { $sort: { createdAt: -1 } },
            { $group: {
                _id: {
                    $cond: [
                        { $eq: ['$sender', userId] },
                        '$recipient',
                        '$sender'
                    ]
                },
                lastMessage: { $first: '$content' },
                lastTime: { $first: '$createdAt' },
                lastSender: { $first: '$sender' }
            }},
            { $lookup: {
                from: 'messages',
                let: { otherUserId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$sender', '$$otherUserId'] },
                                    { $eq: ['$recipient', userId] },
                                    { $eq: ['$isRead', false] }
                                ]
                            }
                        }
                    },
                    { $count: 'count' }
                ],
                as: 'unread'
            }},
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }},
            { $unwind: '$user' },
            { $project: {
                _id: 1,
                lastMessage: 1,
                lastTime: 1,
                unreadCount: { $ifNull: [{ $arrayElemAt: ['$unread.count', 0] }, 0] },
                userName: '$user.fullName',
                userAvatar: '$user.avatar',
                userRole: '$user.profileRole',
            }},
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);

        res.status(200).json({
            success: true,
            data: conversations.map((conversation) => ({
                ...conversation,
                ui: {
                    initials: getInitials(conversation.userName),
                    color: '#F28B22',
                    name: conversation.userName,
                    message: conversation.lastMessage,
                    time: getRelativeTime(conversation.lastTime),
                    unreadCount: conversation.unreadCount,
                    isOnline: false,
                },
            })),
        });
    } catch (error) {
        next(error);
    }
};

const markConversationRead = async (req, res, next) => {
    try {
        const { otherUserId } = req.params;
        const modifiedCount = await markConversationReadByUsers({
            currentUserId: req.user._id,
            otherUserId,
        });
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${otherUserId}`).emit('message:read', {
                byUserId: req.user._id,
                modifiedCount,
            });
        }

        res.status(200).json({ success: true, message: 'Conversation marked as read' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMessages,
    sendMessage,
    getConversations,
    markConversationRead,
};
