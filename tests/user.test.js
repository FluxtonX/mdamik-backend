const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');

describe('User Endpoints', () => {
    let testUser;
    let token;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdamik_test';
        await mongoose.connect(url);

        // Create a test user
        testUser = new User({
            fullName: 'Profile User',
            email: 'profile@example.com',
            phoneNumber: '1122334455',
            firebaseUid: 'profile-uid-789'
        });
        await testUser.save();
        
        // Our mock auth uses firebaseUid as token
        token = 'profile-uid-789';
    });

    afterAll(async () => {
        await User.deleteOne({ _id: testUser._id });
        await mongoose.connection.close();
    });

    it('should get current user profile', async () => {
        const res = await request(app)
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe('profile@example.com');
    });

    it('should update user profile', async () => {
        const res = await request(app)
            .put('/api/user/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({
                fullName: 'Updated Name',
                phoneNumber: '9998887776',
                location: 'New York, USA',
                profileRole: 'Contractor'
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.fullName).toBe('Updated Name');
        expect(res.body.data.phoneNumber).toBe('9998887776');
        expect(res.body.data.ui.location).toBe('New York, USA');
        expect(res.body.data.ui.role).toBe('Contractor');
    });

    it('should update security settings', async () => {
        const res = await request(app)
            .patch('/api/user/security-settings')
            .set('Authorization', `Bearer ${token}`)
            .send({ twoFactorEnabled: true, twoFactorMethod: 'SMS' });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.twoFactorEnabled).toBe(true);
    });

    it('should fail if no token provided', async () => {
        const res = await request(app).get('/api/user/profile');
        expect(res.statusCode).toBe(401);
    });
});
