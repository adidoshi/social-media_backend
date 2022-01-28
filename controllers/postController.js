const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../utils/errorResponse");
const Post = require("../models/PostModel");

// create post
const createPost = asyncHandler(async (req, res, next) => {
  const { desc, img } = req.body;
  if (!desc || !img) {
    res.status(400);
    return next(new ErrorHandler("Fill all the details", 400));
  } else {
    const newPost = new Post({
      user: req.user._id,
      desc,
      img,
    });
    const createdPost = await newPost.save();
    res.status(201).json(createdPost);
  }
});

// update post
const updatePost = asyncHandler(async (req, res, next) => {
  const { desc, img } = req.body;

  const post = await Post.findById(req.params.id);

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    return next(new ErrorHandler("You can't perform this action", 401));
  }

  if (post) {
    post.desc = desc;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } else {
    res.status(404);
    return next(new ErrorHandler("Post not found", 404));
  }
});

// Delete a post
const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  console.log(post.user);

  if (post.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You can't perform this action", 401));
  }

  if (post) {
    await post.remove();
    res.status(200).json({ message: "Post Removed" });
  } else {
    return next(new ErrorHandler("Post not found", 404));
  }
});

// get a post
const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  res.status(200).json(post);
});

// get timeline posts
const timelinePosts = asyncHandler(async (req, res, next) => {
  const userPosts = await Post.find({ userId: req.user._id });
  const friendPosts = await Promise.all(
    currentUser.followings.map((friendId) => {
      return Post.find({ userId: friendId });
    })
  );
  res.status(200).json(userPosts.concat(...friendPosts));
});

// get user's all posts
const userPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ user: req.user._id });
  res.json(posts);
});

// like a post
const likeUnlikePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post.likes.includes(req.body.userId)) {
    await post.updateOne({ $push: { likes: req.body.userId } });
    res.status(200).json("Post has been liked");
  } else {
    await post.updateOne({ $pull: { likes: req.body.userId } });
    res.status(200).json("Post has been disliked");
  }
});

// comment on a post
const commentPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  let commentIndex = -1;

  post.comments.forEach((item, index) => {
    if (item.user.toString() === req.user._id.toString()) {
      commentIndex = index;
    }
  });

  if (commentIndex !== -1) {
    post.comments[commentIndex].comment = req.body.comment;

    await post.save();
    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
    });
  } else {
    post.comments.push({
      user: req.user._id,
      comment: req.body.comment,
    });
    await post.save();
    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
    });
  }
});

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getPost,
  timelinePosts,
  userPosts,
  likeUnlikePost,
  commentPost,
};
