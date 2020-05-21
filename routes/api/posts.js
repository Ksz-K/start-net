const express = require("express");

const {
  createPost,
  getAllPosts,
  getPostByID,
  deletePostByID,
  likePost,
  unlikePost,
  commentPost,
  deleteComment,
} = require("../../controllers/posts");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../../middleware/advancedResults");
const { protect } = require("../../middleware/auth");

router
  .route("/")
  .post(protect, createPost)
  .get(advancedResults(Post), protect, getAllPosts);

router.route("/:id").get(protect, getPostByID).delete(protect, deletePostByID);
router.route("/like/:id").put(protect, likePost);
router.route("/unlike/:id").put(protect, unlikePost);
router.route("/comment/:id/:comment_id").delete(protect, deleteComment);
router.route("/comment/:id").post(protect, commentPost);

module.exports = router;
