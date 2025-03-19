const Role = require('../Models/Role');

const createRole = async(req, res) => {
    try {
        const { name, status } = req.body;

        // Validate input
        if (!name) {
            return res.status(400).json({ error: "Role name is required" });
        }

        // Check if role already exists
        const existingRole = await Role.findOne({ name: name.toLowerCase() });
        if (existingRole) {
            return res.status(409).json({ error: "Role already exists" });
        }

        // Create new role
        const newRole = new Role({
            name: name.toLowerCase(), // Convert to lowercase for consistency
            status: status !== undefined ? status : true // Default status true if not provided
        });

        await newRole.save();
        return res.status(201).json({ message: "Role created successfully", role: newRole });

    } catch (error) {
        console.error("Error creating role:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { createRole };