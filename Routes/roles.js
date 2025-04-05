const express = require('express');
const router = express.Router();
const roles = require('../Controllers/roles');
const { authMiddleware, adminMiddleware, checkPermission } = require("../Middlewares/authMiddleware");

router.post('/createRole', checkPermission, roles.createRole);

module.exports = router;