// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const { authMiddleware, adminMiddleware } = require("../Middlewares/authMiddleware");

// Route to register a new user
router.post('/register', userController.registerUser);
// Route to login a new user
router.post('/login', userController.login);
// Route to get all user
router.get('/users-list', adminMiddleware, userController.getUserslist);
// Route to get all user with role
router.get('/getUsers-ListWithRole', adminMiddleware, userController.getUserslistwithrole);
// Route to get  user getsingleuserdetails with ID
router.post("/get-single-user-details", authMiddleware, userController.getsingleuserdetails);
// Route to get  user usermeta with ID
router.post("/user-meta", authMiddleware, userController.getUserMeta);
// Route to update  user details and usermeta with ID
router.put("/update-user/:user_id", authMiddleware, userController.updateUserDetails);
// Route to Delete user details and usermeta with ID
router.delete("/delete-user/:user_id", authMiddleware, userController.deleteUserDetails);

module.exports = router;