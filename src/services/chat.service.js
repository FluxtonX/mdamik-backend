const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

const getInitials = (name = '') => name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'U';

const formatMessageTime = (date) => new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
});

const getRelativeTime = (date) => {
    const seconds = Math.max(Math.floor((Date.now() - new Date(date).getTime()) / 1000), 0);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const withMessageUi = (messageDoc, currentUserId) => {
    const message = messageDoc.toObject ? messageDoc.toObject() : messageDoc;
    const isMe = message.sender.toString() === currentUserId.toString();
    return {
        ...message,
        ui: {
            message: message.content,
            time: formatMessageTime(message.createdAt),
            isMe,
        },
    };
};

const createChatMessage = async ({ senderId, recipientId, content }) => {
    const [sender, recipient] = await Promise.all([
        User.findById(senderId),
        User.findById(recipientId),
    ]);

    if (!sender) {
        const error = new Error('Sender not found');
        error.status = 404;
        throw error;
    }

    if (!recipient) {
        const error = new Error('Recipient not found');
        error.status = 404;
        throw error;
    }

    const message = await Message.create({
        sender: sender._id,
        recipient: recipient._id,
        content,
    });

    const notification = await Notification.create({
        recipient: recipient._id,
        title: `New Message from ${sender.fullName}`,
        message: content,
        type: 'Chat',
        priority: 'High',
        action: {
            routeName: '/chat/conversation',
            entityId: sender._id.toString(),
            entityType: 'User',
        },
    });

    return { message, notification, sender, recipient };
};

const markConversationReadByUsers = async ({ currentUserId, otherUserId }) => {
    const result = await Message.updateMany(
        { sender: otherUserId, recipient: currentUserId, isRead: false },
        { isRead: true, readAt: new Date() }
    );

    return result.modifiedCount || 0;
};

module.exports = {
    createChatMessage,
    formatMessageTime,
    getInitials,
    getRelativeTime,
    markConversationReadByUsers,
    withMessageUi,
};
