const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth.middleware');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

router.use(protect);

router.get('/conversations',
    [
        query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
    ],
    validate,
    chatController.getConversations
);
router.get('/messages/:otherUserId',
    [
        param('otherUserId').isMongoId().withMessage('otherUserId must be valid'),
        query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
    ],
    validate,
    chatController.getMessages
);
router.patch('/conversations/:otherUserId/read',
    [param('otherUserId').isMongoId().withMessage('otherUserId must be valid')],
    validate,
    chatController.markConversationRead
);
router.post('/messages',
    [
        body('recipient').isMongoId().withMessage('recipient must be valid'),
        body('content').isString().trim().isLength({ min: 1, max: 2000 }).withMessage('content is required and must be under 2000 characters'),
    ],
    validate,
    chatController.sendMessage
);

module.exports = router;
