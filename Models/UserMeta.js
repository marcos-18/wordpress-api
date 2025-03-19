const mongoose = require('mongoose');

const UserMetaSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    meta_key: {
        type: String,
        required: true
    },
    meta_value: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('UserMeta', UserMetaSchema);