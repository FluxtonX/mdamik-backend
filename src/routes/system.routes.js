const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');

router.get('/categories', systemController.getCategories);
router.get('/bundles', systemController.getBundles);
router.get('/help-articles', systemController.getHelpArticles);

module.exports = router;
