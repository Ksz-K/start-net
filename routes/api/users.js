const express = require("express");
const { register, login } = require("../../controllers/users");

const router = express.Router({ mergeParams: true });
const { protect } = require("../../middleware/auth");

router.post("/", register);

module.exports = router;
