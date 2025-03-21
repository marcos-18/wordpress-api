const mongoose = require('mongoose');
const Post = require('../Models/Post');
const PostMeta = require('../Models/postMeta');
const { postValidation } = require('../Validations/postValidation');
const slugify = require("slugify");
const { getPostsWithUsers, getSinglePostUser, deleteUserPosts, updateUserPosts } = require("../Aggregations/postAggregations");

const createnewPost = async(req, res) => {
    try {
        // Validate request body
        const { error } = postValidation.validate(req.body, { allowUnknown: true });
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { post_author, post_content, post_title, post_excerpt, post_status, post_parent, post_type, post_image, image_id } = req.body;

        // Generate slug from post_title
        let post_name = slugify(post_title, { lower: true, strict: true });

        // Check if the slug already exists and modify it if necessary
        let existingPost = await Post.findOne({ post_name });
        let count = 1;
        while (existingPost) {
            post_name = `${slugify(post_title, { lower: true, strict: true })}-${count}`;
            existingPost = await Post.findOne({ post_name });
            count++;
        }

        // Create a new post
        const newPost = new Post({
            post_author,
            post_content,
            post_title,
            post_excerpt: post_excerpt || "",
            post_status: post_status || "publish",
            post_name,
            post_parent: post_parent || null,
            post_type: post_type || "post",
            post_password: "",
            comment_status: "open",
            ping_status: "open",
            comment_count: 0,
        });

        const savedPost = await newPost.save();

        // Insert metadata (e.g., post title and user ID)
        await PostMeta.create({
            post_id: savedPost._id,
            meta_key: "post_title",
            meta_value: post_title,
        });

        await PostMeta.create({
            post_id: savedPost._id,
            meta_key: "post_author",
            meta_value: post_author,
        });

        await PostMeta.create({
            post_id: savedPost._id,
            meta_key: "post_image",
            meta_value: post_image,
        });

        await PostMeta.create({
            post_id: savedPost._id,
            meta_key: "image_id",
            meta_value: image_id,
        });

        res.status(201).json({ message: "Post created successfully", post: savedPost });
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
const getAllPostsWithUsers = async(req, res) => {
    try {
        const posts = await getPostsWithUsers();
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
const getAllPostsWithSingleUsers = async(req, res) => {
    // res.status(200).json({ message: "Posts with single users" });
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }
        const posts = await getSinglePostUser(username);
        res.status(200).json(posts);

    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }

};
const deletePost = async(req, res) => {
    try {
        const post_id = req.params.id;

        // Validate MongoDB ObjectId
        if (!mongoose.isValidObjectId(post_id)) {
            return res.status(400).json({ error: "Invalid post ID format" });
        }

        // Check if post exists before deleting
        const foundPost = await Post.findById(post_id);
        if (!foundPost) {
            return res.status(404).json({ error: "Post ID not found" });
        }

        // Call aggregation function to delete post and related data
        const result = await deleteUserPosts(post_id);

        return res.status(200).json({ result });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
const updatePostData = async(req, res) => {
    try {
        const post_id = req.params.id;
        // Validate MongoDB ObjectId
        if (!mongoose.isValidObjectId(post_id)) {
            return res.status(400).json({ error: "Invalid post ID format" });
        }

        // Check if post exists before deleting
        const foundPost = await Post.findById(post_id);
        if (!foundPost) {
            return res.status(404).json({ error: "Post ID not found" });
        }

        // Call aggregation function to delete post and related data
        const result = await updateUserPosts(post_id, req.body);

        return res.status(200).json({ result });

    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }

};

module.exports = { createnewPost, getAllPostsWithUsers, getAllPostsWithSingleUsers, deletePost, updatePostData };