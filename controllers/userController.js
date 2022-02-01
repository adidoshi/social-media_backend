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
  const user = await User.findById(userId);
  if (user.followers.includes(req.user._id)) {
    return next(new ErrorHandler("You already follow this user", 403));
  }

  User.findByIdAndUpdate(
    userId,
    {
      $push: { followers: req.user._id },
    },
    { new: true },
    (err, result) => {
      if (err) {
        return next(new ErrorHandler(err, 422));
      }
    }
  );

  User.findByIdAndUpdate(
    req.user._id,
    {
      $push: { followings: userId },
    },
    { new: true }
  )
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      return next(new ErrorHandler(err, 422));
    });
});

// PUT req - unfollow user
const unfollowUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user.followers.includes(req.user._id)) {
    return next(new ErrorHandler("You don't follow this user", 403));
  }

  User.findByIdAndUpdate(
    userId,
    {
      $pull: { followers: req.user._id },
    },
    { new: true },
    (err, result) => {
      if (err) {
        return next(new ErrorHandler(err, 422));
      }
    }
  );

  User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { followings: userId },
    },
    { new: true }
  )
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      return next(new ErrorHandler(err, 422));
    });
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
