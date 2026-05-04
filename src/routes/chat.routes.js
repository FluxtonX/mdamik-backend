const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/conversations', chatController.getConversations);
router.get('/messages/:otherUserId', chatController.getMessages);
router.post('/messages', chatController.sendMessage);

module.exports = router;
