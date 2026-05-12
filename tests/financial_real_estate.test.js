const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Transaction = require('../src/models/Transaction');
const Property = require('../src/models/Property');
const PropertyFavorite = require('../src/models/PropertyFavorite');
const PropertyInquiry = require('../src/models/PropertyInquiry');

describe('Financial & Real Estate Endpoints', () => {
    let testUser;
    let token;
    let projectId;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdamik_test';
        await mongoose.connect(url);

        // Create a test user
        testUser = new User({
            fullName: 'Finance User',
            email: 'finance@example.com',
            phoneNumber: '1122334455',
            firebaseUid: 'finance-uid-111'
        });
        await testUser.save();
        token = 'finance-uid-111';

        // Create a project
        const project = new Project({
            userId: testUser._id,
            name: 'Finance Project',
            type: 'House',
            area: 200,
            materialType: 'Concrete',
            totalCost: 100000
        });
        await project.save();
        projectId = project._id;
    });

    afterAll(async () => {
        await User.deleteOne({ _id: testUser._id });
        await Project.deleteMany({ userId: testUser._id });
        await Transaction.deleteMany({ userId: testUser._id });
        await Property.deleteMany({ userId: testUser._id });
        await PropertyFavorite.deleteMany({ userId: testUser._id });
        await PropertyInquiry.deleteMany({ userId: testUser._id });
        await mongoose.connection.close();
    });

    it('should record a transaction and get financials', async () => {
        // Record transaction
        const transRes = await request(app)
            .post('/api/financials/transaction')
            .set('Authorization', `Bearer ${token}`)
            .send({
                projectId,
                title: 'Cement Purchase',
                amount: 5000,
                category: 'Materials',
                type: 'Debit'
            });
        
        expect(transRes.statusCode).toBe(201);

        // Get financials
        const finRes = await request(app)
            .get(`/api/financials/${projectId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(finRes.statusCode).toBe(200);
        expect(finRes.body.data.totalSpent).toBe(5000);
        expect(finRes.body.data.remaining).toBe(95000);
    });

    it('should list and get real estate properties', async () => {
        // List property
        const listRes = await request(app)
            .post('/api/real-estate')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Modern Villa',
                price: 285000,
                location: 'Downtown',
                category: 'Villa',
                type: 'Buy',
                bedrooms: 4,
                bathrooms: 3,
                area: { value: 3200, unit: 'sqft' },
                yearBuilt: 2021,
                features: ['Smart Home Technology', 'Gourmet Kitchen'],
                agent: {
                    name: 'Sarah Johnson',
                    title: 'Senior Real Estate Agent',
                    initials: 'SJ',
                    phone: '+249000000000',
                },
            });
        
        expect(listRes.statusCode).toBe(201);
        expect(listRes.body.data.ui.price).toBe('$285,000');

        // Get list
        const getRes = await request(app).get('/api/real-estate?category=Villa&bedrooms=4');
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body.data.length).toBe(1);
        expect(getRes.body.data[0].ui.beds).toBe(4);
    });

    it('should favorite property and create tour inquiry', async () => {
        const property = await Property.findOne({ userId: testUser._id, category: 'Villa' });

        const favRes = await request(app)
            .post(`/api/real-estate/${property._id}/favorite`)
            .set('Authorization', `Bearer ${token}`);

        expect(favRes.statusCode).toBe(200);
        expect(favRes.body.data.isFavorite).toBe(true);

        const detailsRes = await request(app)
            .get(`/api/real-estate/${property._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(detailsRes.statusCode).toBe(200);
        expect(detailsRes.body.data.isFavorite).toBe(true);
        expect(detailsRes.body.data.ui.agent.name).toBe('Sarah Johnson');

        const inquiryRes = await request(app)
            .post(`/api/real-estate/${property._id}/inquiries`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                type: 'Tour',
                preferredDate: '2026-05-20T10:00:00.000Z',
                message: 'Morning tour please',
                contact: {
                    fullName: 'Finance User',
                    phone: '1122334455',
                },
            });

        expect(inquiryRes.statusCode).toBe(201);
        expect(inquiryRes.body.data.status).toBe('Pending');
    });
});
