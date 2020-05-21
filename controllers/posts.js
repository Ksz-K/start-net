const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Post = require("../models/post");

//@desc     Create a post
//@route    POST /api/posts
//@access   Private

exports.createPost = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const newPost = new Post({
    text: req.body.text,
    name: user.name,
    avatar: user.avatar,
    user: req.user.id,
  });

  const post = await newPost.save();

  res.status(200).json({
    success: true,
    data: post,
  });
});

//@desc     Get all post
//@route    Get /api/posts
//@access   Private

exports.getAllPosts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc     Get post by ID
//@route    Get /api/posts/:id
//@access   Private

exports.getPostByID = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`There is no post of ID ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: post,
  });
});

//@desc     Delete post by ID
//@route    Delete /api/posts/:id
//@access   Private

exports.deletePostByID = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`There is no post of ID ${req.params.id}`, 404)
    );
  }
  //Check user
  if (post.user.toString() === req.user.id) {
    post.remove();
    res.status(200).json({
      success: true,
      data: { msg: "Post removed" },
    });
  } else {
    return next(
      new ErrorResponse(`You are not authorized to delete this post`, 401)
    );
  }
});
