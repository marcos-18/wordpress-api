const mongoose = require("mongoose");
const Post = require("../Models/Post");
const PostMeta = require("../Models/postMeta");
const User = require("../Models/User");
const slugify = require("slugify");

const getPostsWithUsers = async() => {
    return await Post.aggregate([{
            $lookup: {
                from: "users",
                localField: "post_author",
                foreignField: "_id",
                as: "authorDetails",
            },
        },
        {
            $unwind: "$authorDetails", // Convert array to object
        },
        {
            $lookup: {
                from: "postmetas", // Collection name for postMetas
                localField: "_id", // Post ID in posts collection
                foreignField: "post_id", // Matching post_id in postMetas
                as: "postImages",
            },
        },
        {
            $unwind: {
                path: "$postImages",
                preserveNullAndEmptyArrays: true, // Keeps posts even if no image is found
            },
        },
        {
            $match: {
                "postImages.meta_key": "post_image", // Filter only 'post_image' meta key
            },
        },
        {
            $project: {
                _id: 1,
                post_title: 1,
                post_content: 1,
                post_status: 1,
                post_date: 1,
                post_modified: 1,
                post_name: 1,
                author_id: "$authorDetails._id", // User ID
                author_name: "$authorDetails.display_name", // User's Display Name
                post_image: "$postImages.meta_value", // Image URL from postMetas
            },
        },
    ]);
};
const getSinglePostUser = async(userLogin) => {
    return await User.aggregate([{
            $match: { user_login: userLogin }, // Match user by login
        },
        {
            $lookup: {
                from: "posts",
                localField: "_id", // User ID
                foreignField: "post_author", // Match with posts
                as: "userPosts",
            },
        },
        {
            $unwind: "$userPosts", // Convert posts array to objects
        },
        {
            $lookup: {
                from: "postmetas",
                localField: "userPosts._id", // Post ID in posts collection
                foreignField: "post_id", // Match with post_id in postMetas
                as: "postImages",
            },
        },
        {
            $unwind: {
                path: "$postImages",
                preserveNullAndEmptyArrays: true, // Keep posts even if no image
            },
        },
        {
            $match: {
                "postImages.meta_key": "post_image", // Filter only images
            },
        },
        {
            $project: {
                _id: 0, // Hide user object ID
                user_id: "$_id", // User ID
                user_login: "$user_login", // Username
                display_name: "$display_name", // Include Display Name
                post_id: "$userPosts._id", // Post ID
                post_title: "$userPosts.post_title",
                post_content: "$userPosts.post_content",
                post_status: "$userPosts.post_status",
                post_date: "$userPosts.post_date",
                post_name: "$userPosts.post_name",
                post_image: "$postImages.meta_value", // Image URL
            },
        },
    ]);
};
const deleteUserPosts = async(post_id) => {
    // Delete post
    try {
        const postResult = await Post.deleteOne({ _id: post_id });
        const postMetaResult = await PostMeta.deleteMany({ post_id: post_id });
        if (postResult.deletedCount === 0) {
            return { success: false, message: "Post not found" };
        }

        return { success: true, message: "Post deleted successfully" };
    } catch (error) {
        console.error("Error deleting user details:", error);
        throw error;
    }


};
const updateUserPosts = async(post_id, UpdateData) => {
    try {
        // Validate MongoDB ObjectId
        if (!mongoose.isValidObjectId(post_id)) {
            return { error: "Invalid post ID format" };
        }

        const { post_author, post_content, post_title, post_excerpt, post_status, post_name, post_parent, post_image, image_id } = UpdateData;

        let updatedPostFields = {};

        // Update `posts` collection (only if values are provided)
        if (post_content) updatedPostFields.post_content = post_content;
        if (post_excerpt) updatedPostFields.post_excerpt = post_excerpt;
        if (post_status) updatedPostFields.post_status = post_status;
        if (post_name) updatedPostFields.post_name = post_name;
        if (post_parent) updatedPostFields.post_parent = post_parent;
        if (post_author) updatedPostFields.post_author = post_author;
        if (post_title) updatedPostFields.post_title = post_title;
        if (post_image) updatedPostFields.post_image = post_image;

        // Update the `posts` collection
        const updatedPost = await Post.findByIdAndUpdate(post_id, { $set: updatedPostFields }, { new: true });

        if (!updatedPost) {
            return { error: "Post not found" };
        }

        // Update `postmetas` collection (Each field as a separate document)
        const metaUpdates = [];

        if (post_author) {
            metaUpdates.push(
                PostMeta.updateOne({ post_id, meta_key: "post_author" }, { $set: { meta_value: post_author } }, { upsert: true })
            );
        }

        if (post_title) {
            metaUpdates.push(
                PostMeta.updateOne({ post_id, meta_key: "post_title" }, { $set: { meta_value: post_title } }, { upsert: true })
            );
        }

        if (post_image) {
            metaUpdates.push(
                PostMeta.updateOne({ post_id, meta_key: "post_image" }, { $set: { meta_value: post_image } }, { upsert: true })
            );
        }

        if (image_id) {
            metaUpdates.push(
                PostMeta.updateOne({ post_id, meta_key: "image_id" }, { $set: { meta_value: image_id } }, { upsert: true })
            );
        }

        // Execute all meta updates in parallel
        if (metaUpdates.length > 0) {
            await Promise.all(metaUpdates);
        }

        return { message: "Post updated successfully", updatedPost };
    } catch (error) {
        console.error("Error updating post:", error);
        return { error: "Server error", details: error.message };
    }
};

module.exports = { getPostsWithUsers, getSinglePostUser, deleteUserPosts, updateUserPosts };