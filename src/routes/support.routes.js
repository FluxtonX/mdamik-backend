const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.post('/tickets', supportController.createTicket);
router.get('/tickets', supportController.getMyTickets);

module.exports = router;
