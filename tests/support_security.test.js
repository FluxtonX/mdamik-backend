const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const SupportTicket = require('../src/models/SupportTicket');
const Session = require('../src/models/Session');

describe('Support & Security Endpoints', () => {
    let testUser;
    let token;
    let ticketId;
    let sessionId;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdamik_test';
        await mongoose.connect(url);

        testUser = await User.create({
            fullName: 'Support User',
            email: 'support-user@example.com',
            phoneNumber: '1122334455',
            firebaseUid: 'support-user-uid',
        });
        token = testUser.firebaseUid;

        const session = await Session.create({
            userId: testUser._id,
            token: 'session-token',
            device: {
                name: 'iPhone 14 Pro',
                os: 'iOS',
                ip: '127.0.0.1',
                location: 'New York, USA',
            },
        });
        sessionId = session._id;
    });

    afterAll(async () => {
        await SupportTicket.deleteMany({ userId: testUser._id });
        await Session.deleteMany({ userId: testUser._id });
        await User.deleteOne({ _id: testUser._id });
        await mongoose.connection.close();
    });

    it('should create support ticket with UI fields', async () => {
        const res = await request(app)
            .post('/api/support/tickets')
            .set('Authorization', `Bearer ${token}`)
            .send({
                subject: 'Payment not processed',
                message: 'Payment is missing from dashboard',
                priority: 'High',
                category: 'Payments',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.ticketNumber).toMatch(/^TKT-/);
        expect(res.body.data.ui.title).toBe('Payment not processed');
        ticketId = res.body.data._id;
    });

    it('should add ticket reply and list tickets', async () => {
        const replyRes = await request(app)
            .post(`/api/support/tickets/${ticketId}/replies`)
            .set('Authorization', `Bearer ${token}`)
            .send({ message: 'Adding more detail' });

        expect(replyRes.statusCode).toBe(201);
        expect(replyRes.body.data.replies.length).toBe(2);

        const listRes = await request(app)
            .get('/api/support/tickets')
            .set('Authorization', `Bearer ${token}`);

        expect(listRes.statusCode).toBe(200);
        expect(listRes.body.data[0].ui.statusColor).toBeDefined();
    });

    it('should list and revoke active sessions', async () => {
        const listRes = await request(app)
            .get('/api/security/sessions')
            .set('Authorization', `Bearer ${token}`);

        expect(listRes.statusCode).toBe(200);
        expect(listRes.body.data[0].ui.name).toBe('iPhone 14 Pro');

        const revokeRes = await request(app)
            .delete(`/api/security/sessions/${sessionId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(revokeRes.statusCode).toBe(200);
    });
});
