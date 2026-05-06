const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Transport = require('../src/models/Transport');

describe('Transport & Logistics Endpoints', () => {
    let testUser;
    let token;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdamik_test';
        await mongoose.connect(url);

        testUser = new User({
            fullName: 'Transport User',
            email: 'transport@example.com',
            phoneNumber: '9988776655',
            firebaseUid: 'transport-uid-123'
        });
        await testUser.save();
        token = 'transport-uid-123';
    });

    afterAll(async () => {
        await User.deleteOne({ _id: testUser._id });
        await Transport.deleteMany({ userId: testUser._id });
        await mongoose.connection.close();
    });

    it('should get transport estimate', async () => {
        const res = await request(app)
            .get('/api/transport/estimate')
            .query({ weight: 5, loadType: 'Material' })
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.recommendedVehicle).toBe('Heavy Truck');
        expect(res.body.data.estimatedCost).toBeGreaterThan(0);
    });

    it('should book a transport service', async () => {
        const res = await request(app)
            .post('/api/transport/book')
            .set('Authorization', `Bearer ${token}`)
            .send({
                loadType: 'Material',
                weight: 5,
                pickupAddress: 'Warehouse A',
                deliveryAddress: 'Site B',
                vehicleType: 'Heavy Truck'
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.data.trackingId).toBeDefined();
        expect(res.body.data.status).toBe('Pending');
    });
});
