const express = require('express');
const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    });
});

// Import routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const projectRoutes = require('./project.routes');
const serviceRoutes = require('./service.routes');
const financialRoutes = require('./financial.routes');
const propertyRoutes = require('./property.routes');
const chatRoutes = require('./chat.routes');
const notificationRoutes = require('./notification.routes');

// Use routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/projects', projectRoutes);
router.use('/services', serviceRoutes);
router.use('/financials', financialRoutes);
router.use('/real-estate', propertyRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
