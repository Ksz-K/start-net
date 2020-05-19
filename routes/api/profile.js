const express = require("express");
const {
  profile,
  getProfile,
  getAllProfiles,
  getProfileByID,
  deleteProfilenUser,
  addExperience,
} = require("../../controllers/profile");

const router = express.Router({ mergeParams: true });
const Profile = require("../../models/Profile");

const advancedResults = require("../../middleware/advancedResults");
const { protect } = require("../../middleware/auth");

router
  .route("/")
  .get(
    advancedResults(Profile, {
      path: "user",
      select: "name avatar",
    }),
    getAllProfiles
  )
  .post(protect, profile)
  .delete(protect, deleteProfilenUser);
router.get("/me", protect, getProfile);
router.get("/user/:user_id", getProfileByID);
router.put("/experience", protect, addExperience);

module.exports = router;
