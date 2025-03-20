const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../Models/User');
const UserMeta = require('../Models/UserMeta');
const Post = require('../Models/Post');
const PostMeta = require('../Models/postMeta');
const { postValidation } = require('../Validations/postValidation');
const slugify = require("slugify");

const createnewPost = async(req, res) => {
    try {
        // Validate request body
        const { error } = postValidation.validate(req.body, { allowUnknown: true });
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { post_author, post_content, post_title, post_excerpt, post_status, post_parent, post_type } = req.body;

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

        res.status(201).json({ message: "Post created successfully", post: savedPost });
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { createnewPost };