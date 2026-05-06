const request = require('supertest');
const app = require('./src/app');
const mongoose = require('mongoose');
require('dotenv').config();

async function verify() {
    const token = 'manager-uid-123';

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('Testing Management Stats...');
        const statsRes = await request(app)
            .get('/api/management/stats')
            .set('Authorization', `Bearer ${token}`);
        console.log('Stats Result:', JSON.stringify(statsRes.body, null, 2));

        console.log('\nTesting Management Projects...');
        const projectsRes = await request(app)
            .get('/api/management/projects')
            .set('Authorization', `Bearer ${token}`);
        console.log('Projects Count:', projectsRes.body.data.length);
        console.log('First Project:', JSON.stringify(projectsRes.body.data[0], null, 2));

        console.log('\nPHASE 6 SUCCESSFUL');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    }
}

verify();
