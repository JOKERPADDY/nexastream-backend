const express = require('express');
const router = express.Router();
const resolveController = require('../controllers/resolveController');

router.get('/providers', resolveController.getProviders);
router.post('/resolve', resolveController.resolveStream);

module.exports = router;
