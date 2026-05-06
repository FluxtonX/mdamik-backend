const mongoose = require('mongoose');
const User = require('./src/models/User');
const Project = require('./src/models/Project');
const dotenv = require('dotenv');

dotenv.config();

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get or Create a test user
        let user = await User.findOne({ email: 'manager@example.com' });
        if (!user) {
            user = await User.create({
                fullName: 'Project Manager',
                email: 'manager@example.com',
                phoneNumber: '1234567890',
                firebaseUid: 'manager-uid-123'
            });
            console.log('Test user created');
        }

        // 2. Clear old projects
        await Project.deleteMany({ userId: user._id });

        // 3. Seed Management Projects
        await Project.insertMany([
            {
                userId: user._id,
                name: 'Residential Villa - Phase 1',
                type: 'House',
                status: 'In Progress',
                statusType: 'On Track',
                progress: 0.65,
                teamCount: 12,
                totalCost: 85000,
                area: 250,
                materialType: 'Concrete'
            },
            {
                userId: user._id,
                name: 'Commercial Complex',
                type: 'Building',
                status: 'In Progress',
                statusType: 'Delayed',
                progress: 0.45,
                teamCount: 28,
                totalCost: 220000,
                area: 1200,
                materialType: 'Steel'
            },
            {
                userId: user._id,
                name: 'Highway Road Construction',
                type: 'Roads',
                status: 'In Progress',
                statusType: 'On Track',
                progress: 0.85,
                teamCount: 45,
                totalCost: 350000,
                area: 5000,
                materialType: 'Backfill'
            }
        ]);
        console.log('Management projects seeded');

        console.log('\n--- Manual Verification Needed ---');
        console.log('Use Bearer Token: manager-uid-123');
        console.log('1. GET /api/management/stats');
        console.log('2. GET /api/management/projects');

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

runTest();
