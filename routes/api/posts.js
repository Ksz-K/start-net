const express = require("express");

const {
  createPost,
  getAllPosts,
  getPostByID,
  deletePostByID,
} = require("../../controllers/posts");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../../middleware/advancedResults");
const { protect } = require("../../middleware/auth");

router
  .route("/")
  .post(protect, createPost)
  .get(advancedResults(Post), protect, getAllPosts);

router.route("/:id").get(protect, getPostByID).delete(protect, deletePostByID);

module.exports = router;
