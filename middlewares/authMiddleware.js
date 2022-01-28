const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const ErrorHandler = require("../utils/errorResponse");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      // decode token id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      return next(new ErrorHandler("Not Authorized, token falied", 401));
    }
  }

  if (!token) {
    return next(new ErrorHandler("Not Authorized, no token", 401));
  }
});

module.exports = { protect };
