const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        // Connect to a test database
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdamik_test';
        await mongoose.connect(url);
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'Test User',
                email: 'test@example.com',
                phoneNumber: '1234567890',
                firebaseUid: 'test-uid-123'
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe('test@example.com');
    });

    it('should fail to register user with same email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'Another User',
                email: 'test@example.com',
                phoneNumber: '0987654321',
                firebaseUid: 'test-uid-456'
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should verify user login', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                firebaseUid: 'test-uid-123'
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.fullName).toBe('Test User');
    });

    it('should send and verify OTP', async () => {
        const phoneNumber = '+1234567890';
        
        // Send OTP
        const sendRes = await request(app)
            .post('/api/auth/otp/send')
            .send({ phoneNumber });
        
        expect(sendRes.statusCode).toBe(200);
        expect(sendRes.body.success).toBe(true);

        // In the mock controller, we can't easily get the OTP from the test
        // So we'll fetch it from the database for the purpose of the test
        const Otp = require('../src/models/Otp');
        const otpRecord = await Otp.findOne({ phoneNumber });
        const otp = otpRecord.otp;

        // Verify OTP
        const verifyRes = await request(app)
            .post('/api/auth/otp/verify')
            .send({ phoneNumber, otp });
        
        expect(verifyRes.statusCode).toBe(200);
        expect(verifyRes.body.success).toBe(true);
    });
});
