const mongoose = require("mongoose");

const PostMetaSchema = new mongoose.Schema({
        post_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post", // Reference to the Post model
            required: true,
            index: true, // Index for faster queries
        },
        meta_data: {
            type: Map, // Stores key-value pairs efficiently
            of: mongoose.Schema.Types.Mixed, // Allows string, number, object, etc.
            required: true,
        },
    }, { timestamps: true } // Adds createdAt & updatedAt fields
);

module.exports = mongoose.model("PostMeta", PostMetaSchema);