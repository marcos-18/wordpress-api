const express = require("express");
const router = express.Router();
const Permission = require("../Models/Permission");
const premissionController = require("../Controllers/premissionController");
const { authMiddleware, adminMiddleware } = require("../Middlewares/authMiddleware");

router.post("/addpermission", adminMiddleware, premissionController.routePermission);
router.delete("/deletepermission/:id", adminMiddleware, premissionController.deletepremission);
router.get("/getallpermissions", adminMiddleware, premissionController.getallpermissions);

module.exports = router;