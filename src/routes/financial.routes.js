const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financial.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/:projectId', financialController.getProjectFinancials);
router.post('/transaction', financialController.recordTransaction);

module.exports = router;
