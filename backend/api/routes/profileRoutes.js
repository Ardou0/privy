const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticateToken = require('../auth');

router.put('/update', authenticateToken, profileController.update);
router.get('/hide', authenticateToken, profileController.hide);
router.delete("/remove", authenticateToken, profileController.remove);
router.get('/search/:pseudo', authenticateToken, profileController.search);

module.exports = router;