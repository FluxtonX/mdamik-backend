const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');

mongoose.connect('mongodb://localhost:27017/mdamik_test').then(async () => {
    try {
        const t = new Transaction({
            projectId: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(),
            title: 'Test',
            amount: 100,
            category: 'Materials',
            type: 'Debit',
        });
        await t.save();
        console.log('Success');
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
});
