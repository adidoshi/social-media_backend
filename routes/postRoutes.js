const express = require("express");
const {
  createPost,
  likeUnlikePost,
  updatePost,
  deletePost,
  getPost,
  timelinePosts,
  commentPost,
  userPosts,
} = require("../controllers/postController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create", protect, createPost);
router.put("/update", protect, updatePost);
router.get("/:id", protect, getPost).delete("/:id", protect, deletePost);
router.get("/timeline/:userId", protect, timelinePosts);
router.get("/userPosts", protect, userPosts);
router.put("/:id/like", protect, likeUnlikePost);
router.put("/comment/:id", protect, commentPost);

module.exports = router;
