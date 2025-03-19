const express = require('express');
const router = express.Router();
const roles = require('../Controllers/roles');

router.post('/createRole', roles.createRole);

module.exports = router;