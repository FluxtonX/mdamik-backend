const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Transaction = require('../src/models/Transaction');

describe('Management Dashboard Endpoints', () => {
    let testUser;
    let token;
    let projectId;
    let actionId;

    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdamik_test';
        await mongoose.connect(url);

        testUser = await User.create({
            fullName: 'Manager User',
            email: 'manager-dashboard@example.com',
            phoneNumber: '1122334455',
            firebaseUid: 'manager-dashboard-uid',
        });
        token = testUser.firebaseUid;

        const project = await Project.create({
            userId: testUser._id,
            name: 'Residential Villa - Phase 1',
            type: 'House',
            status: 'In Progress',
            statusType: 'On Track',
            progress: 0.65,
            teamCount: 2,
            totalCost: 85000,
            area: 250,
            materialType: 'Concrete',
            phase: 'Phase 1',
            targetDate: '2026-06-30T00:00:00.000Z',
            milestones: [
                {
                    title: 'Foundation & Structure',
                    status: 'In Progress',
                    progress: 0.75,
                    targetDate: '2026-05-15T00:00:00.000Z',
                },
            ],
            teamMembers: [
                { name: 'Member One', role: 'Engineer', initials: 'M1' },
                { name: 'Member Two', role: 'Foreman', initials: 'M2' },
            ],
            pendingActions: [
                {
                    title: 'Pending Action Required',
                    description: 'Material delivery approval needed for next phase',
                    type: 'Material',
                },
            ],
        });
        projectId = project._id;
        actionId = project.pendingActions[0]._id;

        await Transaction.create({
            projectId,
            userId: testUser._id,
            title: 'Cement Purchase',
            amount: 55000,
            category: 'Materials',
            type: 'Debit',
        });
    });

    afterAll(async () => {
        await Transaction.deleteMany({ userId: testUser._id });
        await Project.deleteMany({ userId: testUser._id });
        await User.deleteOne({ _id: testUser._id });
        await mongoose.connection.close();
    });

    it('should return management stats from transactions', async () => {
        const res = await request(app)
            .get('/api/management/stats')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.activeProjects).toBe(1);
        expect(res.body.data.totalSpent).toBe(55000);
        expect(res.body.data.ui.totalSpent).toBe('$55k');
    });

    it('should return project cards with Flutter ui fields', async () => {
        const res = await request(app)
            .get('/api/management/projects')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data[0].ui.title).toBe('Residential Villa - Phase 1');
        expect(res.body.data[0].ui.spent).toBe('$55k');
        expect(res.body.data[0].ui.currentMilestone.title).toBe('Foundation & Structure');
        expect(res.body.data[0].ui.pendingAction.description).toMatch(/Material delivery/);
    });

    it('should add team members and resolve project actions', async () => {
        const teamRes = await request(app)
            .post(`/api/management/projects/${projectId}/team`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Member Three', role: 'Architect', initials: 'M3' });

        expect(teamRes.statusCode).toBe(201);
        expect(teamRes.body.data.name).toBe('Member Three');

        const actionRes = await request(app)
            .patch(`/api/management/projects/${projectId}/actions/${actionId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'Resolved' });

        expect(actionRes.statusCode).toBe(200);
        expect(actionRes.body.data.status).toBe('Resolved');
    });
});
