const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");
const ErrorHandler = require("../utils/errorResponse");

// Register user post request - /api/users/register
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, password, email } = req.body;

  // check if user has provied name, email & password
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please fill all the details", 404));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorHandler("User already exists", 404));
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    return next(new ErrorHandler("Some error occured", 400));
  }
});

// Login user post request - /api/users/login
const loginUser = asyncHandler(async (req, res, next) => {
  const { password, email } = req.body;

  // check if user has provied email & password both
  if (!email || !password) {
    return next(new ErrorHandler("Please enter all the fields", 400));
  }

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    return next(new ErrorHandler("Email or password is incorrect!", 401));
  }
});

module.exports = { registerUser, loginUser };
