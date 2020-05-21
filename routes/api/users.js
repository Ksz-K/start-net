const express = require("express");
const { register } = require("../../controllers/users");

const router = express.Router({ mergeParams: true });
const { protect } = require("../../middleware/auth");

router.post("/", register);

module.exports = router;
