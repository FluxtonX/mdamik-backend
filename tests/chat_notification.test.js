const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Message = require('../src/models/Message');
const Notification = require('../src/models/Notification');

describe('Chat & Notification Endpoints', () => {
    let user1, user2;
    let token1, token2;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdamik_test';
        await mongoose.connect(url);

        user1 = new User({ fullName: 'User One', email: 'one@example.com', phoneNumber: '111', firebaseUid: 'uid-1' });
        user2 = new User({ fullName: 'User Two', email: 'two@example.com', phoneNumber: '222', firebaseUid: 'uid-2' });
        await user1.save();
        await user2.save();

        token1 = 'uid-1';
        token2 = 'uid-2';
    });

    afterAll(async () => {
        await User.deleteMany({ _id: { $in: [user1._id, user2._id] } });
        await Message.deleteMany({ $or: [{ sender: user1._id }, { recipient: user1._id }, { sender: user2._id }, { recipient: user2._id }] });
        await Notification.deleteMany({ recipient: { $in: [user1._id, user2._id] } });
        await mongoose.connection.close();
    });

    it('should send and receive messages', async () => {
        // Send message
        const sendRes = await request(app)
            .post('/api/chat/messages')
            .set('Authorization', `Bearer ${token1}`)
            .send({ recipient: user2._id, content: 'Hello User Two' });
        
        expect(sendRes.statusCode).toBe(201);

        // Get messages
        const getRes = await request(app)
            .get(`/api/chat/messages/${user2._id}`)
            .set('Authorization', `Bearer ${token1}`);
        
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body.data.length).toBe(1);
        expect(getRes.body.data[0].content).toBe('Hello User Two');
        expect(getRes.body.data[0].ui.isMe).toBe(true);

        const notification = await Notification.findOne({ recipient: user2._id, type: 'Chat' });
        expect(notification).toBeTruthy();
    });

    it('should get conversation list with unread counts', async () => {
        await request(app)
            .post('/api/chat/messages')
            .set('Authorization', `Bearer ${token2}`)
            .send({ recipient: user1._id, content: 'Reply from User Two' });

        const res = await request(app)
            .get('/api/chat/conversations')
            .set('Authorization', `Bearer ${token1}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data[0].ui.name).toBe('User Two');
        expect(res.body.data[0].ui.unreadCount).toBeGreaterThan(0);
    });

    it('should get notifications', async () => {
        // Create a dummy notification
        const notification = new Notification({
            recipient: user1._id,
            title: 'Welcome',
            message: 'Thanks for joining'
        });
        await notification.save();

        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${token1}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].ui.title).toBeDefined();
    });

    it('should mark all notifications as read', async () => {
        const res = await request(app)
            .patch('/api/notifications/read-all')
            .set('Authorization', `Bearer ${token1}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.modifiedCount).toBeGreaterThanOrEqual(1);
    });
});
