const mongoose = require('mongoose');
const Permission = require("../Models/Permission");

// ✅ Add permissions
const routePermission = async(req, res) => {

    const { name, user_roles, access } = req.body;
    try {

        if (!name || !user_roles || !access) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const permission = new Permission({
            name,
            user_roles,
            access,
        });
        await permission.save();
        res.status(201).json(permission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }

};
// ✅ Delete permissions by id
const deletepremission = async(req, res) => {
    try {
        const id = req.params.id;

        // console.log("idddddddd", id)
        // Check if the provided ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid permission ID" });
        }

        // Find and delete the permission
        const deletedPermission = await Permission.findByIdAndDelete(id);

        if (!deletedPermission) {
            return res.status(404).json({ message: "Permission not found" });
        }

        res.json({ message: "Permission deleted successfully", deletedPermission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// ✅ Get all permissions
const getallpermissions = async(req, res) => {
    try {
        const permissions = await Permission.find();
        res.json(permissions);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


module.exports = { routePermission, deletepremission, getallpermissions };