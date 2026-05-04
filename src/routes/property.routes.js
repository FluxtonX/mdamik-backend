const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { protect } = require('../middlewares/auth.middleware');

// Public listing
router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);

// Protected listing (requires login to list property)
router.post('/', protect, propertyController.listProperty);

module.exports = router;
