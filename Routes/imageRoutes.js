const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const { uploadImage } = require("../controllers/imageController");
const { authMiddleware, adminMiddleware } = require("../Middlewares/authMiddleware");

//router.post("/upload", upload.single("image"), uploadImage);
router.post("/upload", authMiddleware, upload.single("image"), uploadImage);
module.exports = router;