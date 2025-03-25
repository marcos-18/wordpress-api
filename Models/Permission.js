const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    user_roles: {
        type: [String], // Array of roles (e.g., ['admin', 'user'])
        required: true,
    },
    access: {
        type: [String], // List of permissions (e.g., ['createPost', 'delete-post/:id'])
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Permission", PermissionSchema);