const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: "./uploads", // Save temp files locally before Cloudinary
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

module.exports = upload;