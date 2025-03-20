const mongoose = require("mongoose");
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

module.exports = { getUsersWithDetails, getSingleUserDetails };