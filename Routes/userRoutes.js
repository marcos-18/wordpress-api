// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to register a new user
router.post('/register', userController.registerUser);

// Route to get all user
router.get('/users-list', userController.getUserslist);
// Route to get  user usermeta
router.post('/user-meta', userController.getUserMeta);

module.exports = router;