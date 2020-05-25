const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Post = require("../models/Post");

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

//@desc     Like a post (update post by its ID)
//@route    PUT /api/posts/like/:id
//@access   Private

exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`There is no post of ID ${req.params.id}`, 404)
    );
  }
  //Check if user has already liked this post
  if (
    post.likes.filter((like) => like.user.toString() === req.user.id).length > 0
  ) {
    return next(new ErrorResponse(`Post already liked`, 400));
  }

  post.likes.unshift({ user: req.user.id });
  await post.save();
  res.status(200).json({
    success: true,
    data: post.likes,
  });
});

//@desc     unLike a post (update post by its ID)
//@route    PUT /api/posts/unlike/:id
//@access   Private

exports.unlikePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`There is no post of ID ${req.params.id}`, 404)
    );
  }
  //Check if user has already liked this post
  if (
    post.likes.filter((like) => like.user.toString() === req.user.id).length ===
    0
  ) {
    return next(new ErrorResponse(`Post has not yet been liked`, 400));
  }

  //Get remove index
  const removeIndex = post.likes
    .map((like) => like.user.toString())
    .indexOf(req.user.id);
  post.likes.splice(removeIndex, 1);

  await post.save();
  res.status(200).json({
    success: true,
    data: post.likes,
  });
});

//@desc     Comment on a post
//@route    POST /api/posts/comment:id
//@access   Private

exports.commentPost = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const post = await Post.findById(req.params.id);

  const newComment = {
    text: req.body.text,
    name: user.name,
    avatar: user.avatar,
    user: req.user.id,
  };

  post.comments.unshift(newComment);

  await post.save();

  res.status(200).json({
    success: true,
    data: post.comments,
  });
});

//@desc     Delete comment
//@route    POST /api/posts/comment/:id/:comment_id
//@access   Private

exports.deleteComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  //Pull out comment
  const comment = post.comments.find(
    (comment) => comment.id === req.params.comment_id
  );

  //Make sure comment exists
  if (!comment) {
    return next(
      new ErrorResponse(
        `There is no comment of ID ${req.params.comment_id}`,
        404
      )
    );
  }

  //Check if user is comment creator
  if (comment.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`You are not authorized to delete this comment`, 401)
    );
  } else {
    //Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.status(200).json({
      success: true,
      data: post.comments,
    });
  }
});
