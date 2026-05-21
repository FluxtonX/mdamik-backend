require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const http = require('http');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const httpServer = http.createServer(app);

initSocket(httpServer, app);

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });

    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });