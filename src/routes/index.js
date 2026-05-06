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
const managementRoutes = require('./management.routes');
const paymentRoutes = require('./payment.routes');
const supportRoutes = require('./support.routes');
const transportRoutes = require('./transport.routes');
const securityRoutes = require('./security.routes');
const systemRoutes = require('./system.routes');

// Use routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/projects', projectRoutes);
router.use('/services', serviceRoutes);
router.use('/financials', financialRoutes);
router.use('/real-estate', propertyRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/management', managementRoutes);
router.use('/payments', paymentRoutes);
router.use('/support', supportRoutes);
router.use('/transport', transportRoutes);
router.use('/security', securityRoutes);
router.use('/system', systemRoutes);

module.exports = router;
