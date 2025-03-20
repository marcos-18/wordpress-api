const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const User = require("../Models/User");
const Role = require("../Models/Role");
const UserMeta = require("../Models/UserMeta");

const getUsersWithDetails = async() => {
    try { // Fetch users with their roles and usermeta
        const users = await User.aggregate([{
                $lookup: {
                    from: "roles", // Join with roles collection
                    localField: "user_role",
                    foreignField: "_id",
                    as: "role_info"
                }
            },
            {
                $unwind: "$role_info" // Convert role array into an object
            },
            {
                $lookup: {
                    from: "usermetas", // Join with usermeta collection
                    localField: "_id",
                    foreignField: "user_id",
                    as: "user_meta"
                }
            },
            {
                $project: {
                    _id: 1,
                    user_login: 1,
                    user_email: 1,
                    display_name: 1,
                    user_status: 1,
                    user_registered: 1,
                    role_name: "$role_info.name", // Extract role name
                    first_name: {
                        $arrayElemAt: [{
                                $filter: {
                                    input: "$user_meta",
                                    as: "meta",
                                    cond: { $eq: ["$$meta.meta_key", "first_name"] }
                                }
                            },
                            0
                        ]
                    },
                    last_name: {
                        $arrayElemAt: [{
                                $filter: {
                                    input: "$user_meta",
                                    as: "meta",
                                    cond: { $eq: ["$$meta.meta_key", "last_name"] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    user_login: 1,
                    user_email: 1,
                    display_name: 1,
                    user_status: 1,
                    user_registered: 1,
                    role_name: 1,
                    first_name: "$first_name.meta_value",
                    last_name: "$last_name.meta_value"
                }
            }
        ]);

        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

const getSingleUserDetails = async(user_id) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(user_id);

        const user = await User.aggregate([{
                $match: { _id: userObjectId } // Find user by ID
            },
            {
                $lookup: {
                    from: "roles",
                    localField: "user_role",
                    foreignField: "_id",
                    as: "role_info"
                }
            },
            {
                $unwind: {
                    path: "$role_info",
                    preserveNullAndEmptyArrays: true // Keep user even if no role found
                }
            },
            {
                $lookup: {
                    from: "usermetas",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "user_meta"
                }
            },
            {
                $project: {
                    _id: 1,
                    user_login: 1,
                    user_email: 1,
                    display_name: 1,
                    user_status: 1,
                    user_registered: 1,
                    role_name: "$role_info.name",
                    first_name: {
                        $arrayElemAt: [{
                                $filter: {
                                    input: "$user_meta",
                                    as: "meta",
                                    cond: { $eq: ["$$meta.meta_key", "first_name"] }
                                }
                            },
                            0
                        ]
                    },
                    last_name: {
                        $arrayElemAt: [{
                                $filter: {
                                    input: "$user_meta",
                                    as: "meta",
                                    cond: { $eq: ["$$meta.meta_key", "last_name"] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    user_login: 1,
                    user_email: 1,
                    display_name: 1,
                    user_status: 1,
                    user_registered: 1,
                    role_name: 1,
                    first_name: "$first_name.meta_value",
                    last_name: "$last_name.meta_value"
                }
            }
        ]);

        return user.length ? user[0] : null;
    } catch (error) {
        console.error("Aggregation error:", error);
        throw error;
    }
};



const updateSingleUserDetails = async(user_id, updateData) => {
    try {
        const { first_name, last_name, user_email, user_role, user_pass, user_status } = updateData;

        let updatedFields = {};

        // Update only if values are provided (not empty or null)
        if (user_email) updatedFields.user_email = user_email;
        if (user_role) updatedFields.user_role = user_role;
        if (user_status !== undefined) updatedFields.user_status = user_status; // Boolean field

        // Hash password only if provided
        if (user_pass) {
            const hashedPassword = await bcrypt.hash(user_pass, 10);
            updatedFields.user_pass = hashedPassword;
        }

        // Step 1: Fetch user meta details to construct display_name
        const existingFirstName = await UserMeta.findOne({ user_id, meta_key: "first_name" });
        const existingLastName = await UserMeta.findOne({ user_id, meta_key: "last_name" });

        const newFirstName = first_name || (existingFirstName ? existingFirstName.meta_value : "");
        const newLastName = last_name || (existingLastName ? existingLastName.meta_value : "");

        // Construct display_name if first_name or last_name is updated
        if (first_name || last_name) {
            updatedFields.display_name = `${newFirstName} ${newLastName}`.trim();
        }

        // Step 2: Update User Collection
        const userUpdateResult = await User.updateOne({ _id: new mongoose.Types.ObjectId(user_id) }, { $set: updatedFields });

        // Step 3: Update UserMeta Collection for first_name & last_name
        const metaUpdates = [];
        if (first_name) metaUpdates.push({ meta_key: "first_name", meta_value: first_name });
        if (last_name) metaUpdates.push({ meta_key: "last_name", meta_value: last_name });

        if (metaUpdates.length > 0) {
            const bulkOperations = metaUpdates.map((meta) => ({
                updateOne: {
                    filter: { user_id: new mongoose.Types.ObjectId(user_id), meta_key: meta.meta_key },
                    update: { $set: { meta_value: meta.meta_value } },
                    upsert: true, // Insert if not exists
                },
            }));
            await UserMeta.bulkWrite(bulkOperations);
        }

        return { success: true, message: "User updated successfully" };
    } catch (error) {
        console.error("Error updating user details:", error);
        throw error;
    }
};

module.exports = { getUsersWithDetails, getSingleUserDetails, updateSingleUserDetails };