const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Transaction = require('../src/models/Transaction');

describe('Project Endpoints', () => {
    let testUser;
    let token;
    let projectId;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdamik_test';
        await mongoose.connect(url);

        // Create a test user
        testUser = new User({
            fullName: 'Project Owner',
            email: 'owner@example.com',
            phoneNumber: '1122334455',
            firebaseUid: 'owner-uid-999'
        });
        await testUser.save();
        
        token = 'owner-uid-999';
    });

    afterAll(async () => {
        await User.deleteOne({ _id: testUser._id });
        await Project.deleteMany({ userId: testUser._id });
        await Transaction.deleteMany({ userId: testUser._id });
        await mongoose.connection.close();
    });

    it('should create a new project', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'My New House',
                type: 'House',
                services: ['Engineering', 'Materials'],
                area: 250,
                materialType: 'Concrete',
                totalCost: 29000,
                costBreakdown: {
                    materials: 12500,
                    labor: 8200,
                    engineering: 4800,
                    finishing: 3500
                },
                phase: 'Phase 1',
                targetDate: '2026-06-30T00:00:00.000Z',
                milestones: [
                    {
                        title: 'Foundation & Structure',
                        status: 'In Progress',
                        progress: 0.75,
                        targetDate: '2026-05-15T00:00:00.000Z',
                        actionRequired: true,
                        actionDesc: 'Material delivery approval needed',
                    },
                ],
                teamMembers: [
                    { name: 'Member One', role: 'Engineer', initials: 'M1' },
                ],
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('My New House');
        expect(res.body.data.ui.currentMilestone.title).toBe('Foundation & Structure');
        expect(res.body.data.ui.teamCount).toBe(1);
        projectId = res.body.data._id;
    });

    it('should get my projects', async () => {
        const res = await request(app)
            .get('/api/projects')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].ui.budget).toBe('$29k');
    });

    it('should get project by id', async () => {
        const res = await request(app)
            .get(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.type).toBe('House');
    });

    it('should update project status', async () => {
        const res = await request(app)
            .patch(`/api/projects/${projectId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'In Progress' });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('In Progress');
    });
});
