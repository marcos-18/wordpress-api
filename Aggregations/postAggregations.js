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
                author: {
                    author_id: "$authorDetails._id", // User ID
                    author_name: "$authorDetails.display_name", // User's Display Name
                    author_name: "$authorDetails.user_email", // User's Display Name
                    post_image: "$postImages.meta_value", // Image URL from postMetas
                }

            },
        },
    ]);
};
// const getSinglePostUser = async(userLogin) => {

//     return await User.aggregate([{
//             $match: { user_login: userLogin }, // Match user by login
//         },
//         {
//             $lookup: {
//                 from: "posts",
//                 localField: "_id", // User ID
//                 foreignField: "post_author", // Match with posts
//                 as: "userPosts",
//             },
//         },
//         {
//             $unwind: "$userPosts", // Convert posts array to objects
//         },
//         {
//             $lookup: {
//                 from: "postmetas",
//                 localField: "userPosts._id", // Post ID in posts collection
//                 foreignField: "post_id", // Match with post_id in postMetas
//                 as: "postImages",
//             },
//         },
//         {
//             $unwind: {
//                 path: "$postImages",
//                 preserveNullAndEmptyArrays: true, // Keep posts even if no image
//             },
//         },
//         {
//             $match: {
//                 "postImages.meta_key": "post_image", // Filter only images
//             },
//         },
//         {
//             $project: {
//                 _id: 0, // Hide user object ID
//                 user_id: "$_id", // User ID
//                 user_login: "$user_login", // Username
//                 display_name: "$display_name", // Include Display Name
//                 post_id: "$userPosts._id", // Post ID
//                 post_title: "$userPosts.post_title",
//                 post_content: "$userPosts.post_content",
//                 post_status: "$userPosts.post_status",
//                 post_date: "$userPosts.post_date",
//                 post_name: "$userPosts.post_name",
//                 post_image: "$postImages.meta_value", // Image URL
//             },
//         },
//     ]);
// };
// const deleteUserPosts = async(post_id) => {
//     // Delete post
//     try {
//         const postResult = await Post.deleteOne({ _id: post_id });
//         const postMetaResult = await PostMeta.deleteMany({ post_id: post_id });
//         if (postResult.deletedCount === 0) {
//             return { success: false, message: "Post not found" };
//         }

//         return { success: true, message: "Post deleted successfully" };
//     } catch (error) {
//         console.error("Error deleting user details:", error);
//         throw error;
//     }
// };
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
                foreignField: "post_id", // Match with post_id in PostMeta
                as: "postMeta",
            },
        },
        {
            $unwind: {
                path: "$postMeta",
                preserveNullAndEmptyArrays: true, // Keep posts even if no metadata
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
                post_image: { $ifNull: ["$postMeta.meta_data.post_image", null] }, // Fetch post_image from meta_data
                image_id: { $ifNull: ["$postMeta.meta_data.image_id", null] }, // Fetch image_id from meta_data
            },
        },
    ]);
};

const deleteUserPosts = async(post_id) => {
    try {
        if (!mongoose.isValidObjectId(post_id)) {
            return { success: false, message: "Invalid post ID format" };
        }

        const objectId = new mongoose.Types.ObjectId(post_id);

        const result = await Post.aggregate([{
                $match: { _id: objectId } // Find the post
            },
            {
                $lookup: {
                    from: "postmetas", // Assuming PostMetas collection is named 'postmetas'
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postMetaDetails"
                }
            },
            {
                $facet: {
                    deletePost: [{ $match: { _id: objectId } }, { $limit: 1 }], // Select post for deletion
                    deletePostMeta: [{ $match: { "postMetaDetails.post_id": objectId } }]
                }
            }
        ]);

        // Delete operations outside aggregation (since MongoDB aggregation can't perform deletes)
        if (result[0].deletePost.length > 0) {
            await Post.deleteOne({ _id: objectId });
            await PostMeta.deleteMany({ post_id: objectId });
            return { success: true, message: "Post and all associated metadata deleted successfully" };
        } else {
            return { success: false, message: "Post not found" };
        }
    } catch (error) {
        console.error("Error deleting post details:", error);
        return { success: false, message: "Server error", details: error.message };
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

        // Construct the metadata update object
        const metaUpdate = {};
        if (post_author) metaUpdate["post_author"] = post_author;
        if (post_title) metaUpdate["post_title"] = post_title;
        if (post_image) metaUpdate["post_image"] = post_image;
        if (image_id) metaUpdate["image_id"] = image_id;

        // Update `postmetas` collection in a single query (using Map structure)
        await PostMeta.findOneAndUpdate({ post_id }, // Find by post_id
            { $set: { meta_data: metaUpdate } }, // Set new meta_data values
            { new: true, upsert: true } // Create new if not exists
        );

        return { message: "Post updated successfully", updatedPost };
    } catch (error) {
        console.error("Error updating post:", error);
        return { error: "Server error", details: error.message };
    }
};

module.exports = { getPostsWithUsers, getSinglePostUser, deleteUserPosts, updateUserPosts };