const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/check', authenticateToken, authController.checkAuth);

module.exports = router;
