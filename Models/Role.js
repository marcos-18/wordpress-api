const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true }
});

module.exports = mongoose.model("Role", roleSchema);