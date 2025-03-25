const express = require('express');
const router = express.Router();
const roles = require('../Controllers/roles');
const { authMiddleware, adminMiddleware } = require("../Middlewares/authMiddleware");

router.post('/createRole', adminMiddleware, roles.createRole);

module.exports = router;