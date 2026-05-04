const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Material = require('../src/models/Material');
const Professional = require('../src/models/Professional');

describe('Service Endpoints', () => {
    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdamik_test';
        await mongoose.connect(url);

        // Seed some data for testing
        await Material.create({ title: 'Test Cement', category: 'Cement', price: 10, unit: 'bag' });
        await Professional.create({ 
            name: 'Test Prof', 
            type: 'Engineer', 
            title: 'Test Eng', 
            price: 50, 
            experience: '5 Years' 
        });
    });

    afterAll(async () => {
        await Material.deleteMany({});
        await Professional.deleteMany({});
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
    });

    it('should get professionals', async () => {
        const res = await request(app).get('/api/services/professionals');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
});
