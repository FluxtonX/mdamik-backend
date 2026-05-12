const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Material = require('../src/models/Material');
const Professional = require('../src/models/Professional');
const ServiceProvider = require('../src/models/ServiceProvider');
const ServiceRequest = require('../src/models/ServiceRequest');
const User = require('../src/models/User');
const Cart = require('../src/models/Cart');
const MaterialOrder = require('../src/models/MaterialOrder');
const Transaction = require('../src/models/Transaction');

describe('Service Endpoints', () => {
    let testUser;
    let token;
    let provider;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdamik_test';
        await mongoose.connect(url);

        testUser = await User.create({
            fullName: 'Service User',
            email: 'service-user@example.com',
            phoneNumber: '1234567890',
            firebaseUid: 'service-user-uid',
        });
        token = testUser.firebaseUid;

        // Seed some data for testing
        await Material.create({ title: 'Test Cement', category: 'Cement', price: 10, unit: 'bag' });
        await Professional.create({ 
            name: 'Test Prof', 
            type: 'Engineer', 
            title: 'Test Eng', 
            price: 50, 
            experience: '5 Years' 
        });
        provider = await ServiceProvider.create({
            name: 'Test Mason',
            category: 'Labor',
            serviceType: 'Mason',
            skills: ['Mason'],
            price: { amount: 45, unit: 'day' },
            rating: 4.8,
            reviews: 10,
            experienceYears: 5,
            initials: 'TM',
        });
    });

    afterAll(async () => {
        await Material.deleteMany({});
        await Professional.deleteMany({});
        await ServiceProvider.deleteMany({});
        await ServiceRequest.deleteMany({});
        await Cart.deleteMany({});
        await MaterialOrder.deleteMany({});
        await Transaction.deleteMany({ userId: testUser._id });
        await User.deleteOne({ _id: testUser._id });
        await mongoose.connection.close();
    });

    it('should get materials', async () => {
        const res = await request(app).get('/api/services/materials');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter materials by category', async () => {
        const res = await request(app).get('/api/services/materials?category=Cement');
        expect(res.statusCode).toBe(200);
        expect(res.body.data[0].category).toBe('Cement');
        expect(res.body.data[0].ui.price).toBe('$10.00');
    });

    it('should get professionals', async () => {
        const res = await request(app).get('/api/services/professionals');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should get labor providers with skill filter', async () => {
        const res = await request(app).get('/api/services/labor?skill=Mason');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data[0].category).toBe('Labor');
        expect(res.body.data[0].skills).toContain('Mason');
        expect(res.body.data[0].ui.price).toBe('$45/day');
        expect(res.body.data[0].ui.experience).toBe(5);
    });

    it('should register current user as a labor provider', async () => {
        const res = await request(app)
            .post('/api/services/providers/register')
            .set('Authorization', `Bearer ${token}`)
            .send({
                category: 'Labor',
                serviceType: 'Mason',
                skills: ['Mason'],
                price: { amount: 50, currency: 'USD', unit: 'day' },
                experienceYears: 4,
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.userId).toBe(testUser._id.toString());
        expect(res.body.data.category).toBe('Labor');
        expect(res.body.data.ui.price).toBe('$50/day');
    });

    it('should create a hire request', async () => {
        const res = await request(app)
            .post('/api/services/hire')
            .set('Authorization', `Bearer ${token}`)
            .send({
                providerId: provider._id,
                serviceType: 'Mason',
                quantity: { value: 2, unit: 'day' },
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.status).toBe('Pending');
        expect(res.body.data.estimatedCost).toBe(90);
    });

    it('should calculate excavation estimates', async () => {
        const res = await request(app)
            .post('/api/services/excavation/estimate')
            .send({
                length: 10,
                width: 8,
                depth: 3,
                excavationType: 'Foundation Excavation',
                soilType: 'Mixed Soil',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.volume).toBe(240);
        expect(res.body.data.totalEstimate).toBe(3600);
    });

    it('should add materials to cart and checkout into a transaction', async () => {
        const material = await Material.findOne({ category: 'Cement' });

        const addRes = await request(app)
            .post('/api/services/cart/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ materialId: material._id, quantity: 3 });

        expect(addRes.statusCode).toBe(200);
        expect(addRes.body.data.items).toHaveLength(1);
        expect(addRes.body.data.total).toBe(30);

        const checkoutRes = await request(app)
            .post('/api/services/cart/checkout')
            .set('Authorization', `Bearer ${token}`)
            .send({
                currency: 'USD',
                deliveryAddress: {
                    fullName: 'Service User',
                    phone: '1234567890',
                    address: 'Site A',
                },
            });

        expect(checkoutRes.statusCode).toBe(201);
        expect(checkoutRes.body.data.order.orderNumber).toMatch(/^MAT-/);
        expect(checkoutRes.body.data.transaction.amount).toBe(30);
        expect(checkoutRes.body.data.transaction.category).toBe('Materials');
    });
});
