const express = require("express");
const { getMe, login } = require("../../controllers/auth");

const router = express.Router({ mergeParams: true });

const { protect } = require("../../middleware/auth");

router.get("/", protect, getMe);
router.post("/", login);

module.exports = router;
