const Message = require('../models/Message');

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

        res.status(200).json({
            success: true,
            data: messages,
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

        const message = new Message({
            sender: req.user._id,
            recipient,
            content,
        });

        await message.save();

        res.status(201).json({
            success: true,
            data: message,
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
                lastTime: { $first: '$createdAt' }
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
                userName: '$user.fullName',
                userAvatar: '$user.avatar'
            }},
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);

        res.status(200).json({
            success: true,
            data: conversations,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMessages,
    sendMessage,
    getConversations,
};
