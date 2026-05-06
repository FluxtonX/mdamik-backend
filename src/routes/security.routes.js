const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/sessions', securityController.getSessions);
router.delete('/sessions/:sessionId', securityController.revokeSession);
router.patch('/verification', securityController.updateVerification);

module.exports = router;
