const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Transaction = require('../src/models/Transaction');

describe('Payment Endpoints', () => {
    let testUser;
    let token;
    let transactionId;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdamik_test';
        await mongoose.connect(url);

        testUser = new User({
            fullName: 'Payment User',
            email: 'payment@example.com',
            phoneNumber: '0991234567',
            firebaseUid: 'payment-uid-999',
        });
        await testUser.save();
        token = 'payment-uid-999';

        const project = new Project({
            userId: testUser._id,
            name: 'Payment Project',
            type: 'House',
            area: 300,
            materialType: 'Concrete',
            totalCost: 50000,
        });
        await project.save();

        const tx = new Transaction({
            projectId: project._id,
            userId: testUser._id,
            title: 'Materials Purchase',
            amount: 1500,
            category: 'Materials',
            type: 'Debit',
        });
        await tx.save();
        transactionId = tx._id;
    });

    afterAll(async () => {
        await User.deleteMany({ email: 'payment@example.com' });
        await Project.deleteMany({ name: 'Payment Project' });
        await Transaction.deleteMany({ title: 'Materials Purchase' });
        await mongoose.connection.close();
    });

    it('should return supported currencies', async () => {
        const res = await request(app).get('/api/payments/currencies');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('USD');
        expect(res.body.data).toHaveProperty('SAR');
        expect(res.body.data).toHaveProperty('SDG');
    });

    it('should return frontend payment methods', async () => {
        const res = await request(app).get('/api/payments/methods');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.some((method) => method.frontendValues.includes('Cash'))).toBe(true);
        expect(res.body.data.some((method) => method.frontendValues.includes('Bangkok Bank'))).toBe(true);
    });

    it('should reject payment initiation with invalid gateway', async () => {
        const res = await request(app)
            .post('/api/payments/initiate')
            .set('Authorization', `Bearer ${token}`)
            .send({ transactionId, gateway: 'Bitcoin', currency: 'USD' });
        expect(res.statusCode).toBe(400);
    });

    it('should reject payment initiation with invalid currency', async () => {
        const res = await request(app)
            .post('/api/payments/initiate')
            .set('Authorization', `Bearer ${token}`)
            .send({ transactionId, gateway: 'COD', currency: 'XYZ' });
        expect(res.statusCode).toBe(400);
    });

    it('should initiate COD payment successfully from Flutter Cash label', async () => {
        const res = await request(app)
            .post('/api/payments/initiate')
            .set('Authorization', `Bearer ${token}`)
            .send({ transactionId, gateway: 'Cash', currency: 'SDG' });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.transaction.paymentGateway).toBe('COD');
        expect(res.body.transaction.status).toBe('Processing');
    });

    it('should confirm COD payment', async () => {
        const res = await request(app)
            .post(`/api/payments/cod/confirm/${transactionId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.transaction.status).toBe('Completed');
    });

    it('should reject double-payment on completed transaction', async () => {
        const res = await request(app)
            .post('/api/payments/initiate')
            .set('Authorization', `Bearer ${token}`)
            .send({ transactionId, gateway: 'COD', currency: 'USD' });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Cannot initiate payment/);
    });

    it('should reject initiation without auth token', async () => {
        const res = await request(app)
            .post('/api/payments/initiate')
            .send({ transactionId, gateway: 'COD', currency: 'USD' });
        expect(res.statusCode).toBe(401);
    });
});
