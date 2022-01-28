const express = require("express");
const {
  updateUser,
  deleteUser,
  getUser,
  followUser,
  unfollowUser,
  getFriends,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", protect, getUser);
router.put("/profile/update", protect, updateUser);
router.delete("/profile/:id", protect, deleteUser);

router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);
router.get("/friends/:userId", protect, getFriends);

module.exports = router;
