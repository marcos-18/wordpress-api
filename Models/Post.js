const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
        post_author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        post_date: {
            type: Date,
            default: Date.now,
        },
        post_date_gmt: {
            type: Date,
            default: Date.now,
        },
        post_content: {
            type: String,
            required: true,
        },
        post_title: {
            type: String,
            required: true,
        },
        post_excerpt: {
            type: String,
            default: "",
        },
        post_status: {
            type: String,
            enum: ["publish", "draft", "pending", "private", "trash"],
            default: "publish",
        },
        comment_status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
        },
        ping_status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
        },
        post_password: {
            type: String,
            default: "",
        },
        post_name: {
            type: String,
            unique: true,
            required: true,
        },
        post_modified: {
            type: Date,
            default: Date.now,
        },
        post_modified_gmt: {
            type: Date,
            default: Date.now,
        },
        post_parent: {
            type: String,
            ref: "Post", // Self-referencing for hierarchical posts
            default: null,
        },
        post_type: {
            type: String,
            default: "post",
        },
        comment_count: {
            type: Number,
            default: 0,
        },
    }, { timestamps: true } // Adds createdAt & updatedAt fields
);

module.exports = mongoose.model("Post", PostSchema);