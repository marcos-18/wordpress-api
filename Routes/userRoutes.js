// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');


// Route to register a new user
router.post('/register', userController.registerUser);
// Route to login a new user
router.post('/login', userController.login);
// Route to get all user
router.get('/users-list', authMiddleware, userController.getUserslist);
// Route to get all user with role
router.get('/getUsers-ListWithRole', authMiddleware, userController.getUserslistwithrole);
// Route to get  user getsingleuserdetails with ID

router.post("/get-single-user-details", authMiddleware, userController.getsingleuserdetails);
// Route to get  user usermeta with ID
//router.post('/user-meta', userController.getUserMeta);
router.post("/user-meta", authMiddleware, userController.getUserMeta);

module.exports = router;