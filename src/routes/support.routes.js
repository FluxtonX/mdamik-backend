const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { protect } = require('../middlewares/auth.middleware');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

router.use(protect);

router.post('/tickets',
    [
        body('subject').isString().trim().isLength({ min: 3, max: 160 }).withMessage('subject is required'),
        body('message').isString().trim().isLength({ min: 3, max: 2000 }).withMessage('message is required'),
        body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
        body('category').optional().isIn(['Payments', 'Labor', 'Materials', 'Transport', 'Account', 'Projects', 'Other']).withMessage('Invalid category'),
    ],
    validate,
    supportController.createTicket
);
router.get('/tickets',
    [
        query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
    ],
    validate,
    supportController.getMyTickets
);
router.post('/tickets/:ticketId/replies',
    [
        param('ticketId').isMongoId().withMessage('ticketId must be valid'),
        body('message').isString().trim().isLength({ min: 1, max: 2000 }).withMessage('message is required'),
    ],
    validate,
    supportController.addTicketReply
);

module.exports = router;
