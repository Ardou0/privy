const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticateToken = require('../auth');

router.post('/update', authenticateToken, profileController.update);
router.delete("/remove", authenticateToken, profileController.remove);
router.get('/:pseudo', authenticateToken, profileController.search);

module.exports = router;