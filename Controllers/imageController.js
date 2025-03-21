const cloudinary = require("../config/cloudinaryConfig"); // Import Cloudinary config

const uploadImage = async(req, res) => {
    try {
        console.log("File received:", req.file); // Log file info

        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "uploads", // Store in "uploads" folder
            use_filename: true,
            unique_filename: true,
        });

        console.log("Cloudinary Upload Result:", result);

        res.status(200).json({
            message: "Image uploaded successfully",
            objectId: result.public_id, // Cloudinary image ID
            imageUrl: result.secure_url, // Image URL
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { uploadImage };