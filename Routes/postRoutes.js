const express = require('express');
const router = express.Router();
const postController = require('../Controllers/postController');
const { authMiddleware, adminMiddleware } = require("../Middlewares/authMiddleware");

// Route to create a new Post
router.post('/createPost', authMiddleware, postController.createnewPost);
module.exports = router;