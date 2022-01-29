const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../utils/errorResponse");

// PUT request - /api/user/profile/update
const updateUser = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    profilePicture,
    coverPicture,
    desc,
    city,
    from,
  } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = name || user.name;
    user.email = email || user.email;
    user.profilePicture = profilePicture || user.profilePicture;
    user.coverPicture = coverPicture || user.coverPicture;
    user.desc = desc || user.desc;
    user.city = city || user.city;
    user.from = from || user.from;
    if (password) {
      user.password = password;
    }
    await user.save();
    res.status(200).json("Account has been updated!");
  } else {
    return next(new ErrorHandler("User Not Found", 404));
  }
});

// DELETE request - /api/user/profile/:id
const deleteUser = asyncHandler(async (req, res, next) => {
  if (req.params.id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You can't perform this action", 401));
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (user) {
    res.status(200).json("Account has been deleted successfully!");
  } else {
    return next(new ErrorHandler("User Not Found", 404));
  }
});

// GET req - /api/user
const getUser = asyncHandler(async (req, res, next) => {
  const userId = req.query.userId;
  const name = req.query.name;

  const user = userId
    ? await User.findById(userId)
    : await User.findOne({ name: name });
  if (!user) {
    return next(new ErrorHandler("Invalid User details", 404));
  }
  const { password, updatedAt, ...other } = user._doc;
  if (user) {
    res.status(200).json(other);
  }
});

// PUT req - follow a user
const followUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  const user = await User.findById(req.params.id);
  const currentUser = await User.findById(userId);

  if (!user || !currentUser) {
    return next(new ErrorHandler("Invalid User details", 404));
  }

  if (!user.followers.includes(userId)) {
    await user.updateOne({ $push: { followers: userId } });
    await currentUser.updateOne({ $push: { followings: req.params.id } });
    res.status(200).json("User has been followed");
  } else {
    res.status(403).json("You already follow this user");
  }
});

// PUT req - unfollow user
const unfollowUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const currentUser = await User.findById(req.body.userId);

  if (user.followers.includes(req.body.userId)) {
    await user.updateOne({ $pull: { followers: req.body.userId } });
    await currentUser.updateOne({ $pull: { followings: req.params.id } });
    res.status(200).json("User has been unfollowed");
  } else {
    res.status(403).json("You don't follow this user");
  }
});

// get friends
const getFriends = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  const friends = await Promise.all(
    user.followings.map((friendId) => {
      return User.findById(friendId);
    })
  );

  let friendList = [];
  friends.map((friend) => {
    const { _id, name, profilePicture } = friend;
    friendList.push({ _id, name, profilePicture });
  });
  res.status(200).json(friendList);
});

module.exports = {
  updateUser,
  deleteUser,
  getUser,
  unfollowUser,
  followUser,
  getFriends,
};
