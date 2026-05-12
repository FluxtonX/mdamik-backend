const { Server } = require('socket.io');
const User = require('./models/User');
const {
    createChatMessage,
    markConversationReadByUsers,
    withMessageUi,
} = require('./services/chat.service');

const onlineUsers = new Map();

const getUserRoom = (userId) => `user:${userId}`;

const addOnlineSocket = (userId, socketId) => {
    const key = userId.toString();
    const sockets = onlineUsers.get(key) || new Set();
    sockets.add(socketId);
    onlineUsers.set(key, sockets);
};

const removeOnlineSocket = (userId, socketId) => {
    const key = userId.toString();
    const sockets = onlineUsers.get(key);
    if (!sockets) return;
    sockets.delete(socketId);
    if (sockets.size === 0) {
        onlineUsers.delete(key);
    }
};

const isUserOnline = (userId) => onlineUsers.has(userId.toString());

const initSocket = (httpServer, app) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.SOCKET_CORS_ORIGIN || '*',
            methods: ['GET', 'POST'],
        },
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth && socket.handshake.auth.token
                ? socket.handshake.auth.token
                : socket.handshake.headers.authorization
                    ? socket.handshake.headers.authorization.replace('Bearer ', '')
                    : null;

            if (!token) {
                return next(new Error('Authentication token required'));
            }

            const user = await User.findOne({ firebaseUid: token });
            if (!user) {
                return next(new Error('Invalid authentication token'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(error);
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        socket.join(getUserRoom(userId));
        addOnlineSocket(userId, socket.id);

        socket.broadcast.emit('presence:update', { userId, isOnline: true });

        socket.on('message:send', async (payload = {}, ack) => {
            try {
                const { recipient, content, clientMessageId } = payload;
                if (!recipient || !content || typeof content !== 'string' || content.trim().length === 0) {
                    throw new Error('recipient and content are required');
                }
                if (content.length > 2000) {
                    throw new Error('content must be under 2000 characters');
                }

                const { message, notification } = await createChatMessage({
                    senderId: socket.user._id,
                    recipientId: recipient,
                    content: content.trim(),
                });

                const senderPayload = {
                    clientMessageId,
                    message: withMessageUi(message, socket.user._id),
                };
                const recipientPayload = {
                    message: withMessageUi(message, recipient),
                };

                io.to(getUserRoom(recipient)).emit('message:new', recipientPayload);
                io.to(getUserRoom(recipient)).emit('notification:new', notification);
                socket.emit('message:sent', senderPayload);

                if (typeof ack === 'function') {
                    ack({ success: true, data: senderPayload.message });
                }
            } catch (error) {
                if (typeof ack === 'function') {
                    ack({ success: false, message: error.message });
                } else {
                    socket.emit('chat:error', { message: error.message });
                }
            }
        });

        socket.on('message:read', async (payload = {}, ack) => {
            try {
                const { otherUserId } = payload;
                if (!otherUserId) throw new Error('otherUserId is required');

                const modifiedCount = await markConversationReadByUsers({
                    currentUserId: socket.user._id,
                    otherUserId,
                });

                io.to(getUserRoom(otherUserId)).emit('message:read', {
                    byUserId: userId,
                    modifiedCount,
                });

                if (typeof ack === 'function') {
                    ack({ success: true, data: { modifiedCount } });
                }
            } catch (error) {
                if (typeof ack === 'function') {
                    ack({ success: false, message: error.message });
                }
            }
        });

        socket.on('typing:start', (payload = {}) => {
            if (!payload.recipient) return;
            io.to(getUserRoom(payload.recipient)).emit('typing:start', { userId });
        });

        socket.on('typing:stop', (payload = {}) => {
            if (!payload.recipient) return;
            io.to(getUserRoom(payload.recipient)).emit('typing:stop', { userId });
        });

        socket.on('presence:get', (payload = {}, ack) => {
            const userIds = Array.isArray(payload.userIds) ? payload.userIds : [];
            const presence = userIds.reduce((result, id) => {
                result[id] = isUserOnline(id);
                return result;
            }, {});

            if (typeof ack === 'function') {
                ack({ success: true, data: presence });
            }
        });

        socket.on('disconnect', () => {
            removeOnlineSocket(userId, socket.id);
            if (!isUserOnline(userId)) {
                socket.broadcast.emit('presence:update', { userId, isOnline: false });
            }
        });
    });

    app.set('io', io);
    return io;
};

module.exports = {
    initSocket,
    isUserOnline,
};
