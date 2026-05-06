const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transport.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/estimate', transportController.getEstimate);
router.post('/book', transportController.bookTransport);
router.get('/my-transports', transportController.getMyTransports);

module.exports = router;
