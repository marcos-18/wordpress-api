const express = require('express');
const router = express.Router();
const postController = require('../Controllers/postController');
const { authMiddleware, adminMiddleware } = require("../Middlewares/authMiddleware");

// Route to create a new Post
router.post('/createPost', authMiddleware, postController.createnewPost);
router.get("/posts-with-users", adminMiddleware, postController.getAllPostsWithUsers);
router.get("/posts-with-Singleusers", authMiddleware, postController.getAllPostsWithSingleUsers);
router.delete("/delete-post/:id", authMiddleware, postController.deletePost);
router.put("/update-post/:id", authMiddleware, postController.updatePostData);

module.exports = router;