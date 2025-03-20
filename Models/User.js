const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    user_login: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },

    user_pass: {
        type: String,
        required: true
    },

    user_email: {
        type: String,
    },

    display_name: {
        type: String,
        trim: true
    },

    user_registered: {
        type: Date,
        default: Date.now
    },

    user_role: {
        type: mongoose.Schema.Types.ObjectId, //ObjectId
        ref: "Role", // Ref to Role model
        default: new mongoose.Types.ObjectId("67d8113e61ba6a93578ffcba")
    },

    user_status: {
        type: Boolean,
        default: false,
        enum: [true, false]
    }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);