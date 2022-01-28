const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const logger = require("morgan");
const cors = require("cors");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const notFound = require("./middlewares/notFoundMiddleware");

// Connect DB
const connectDB = require("./config/db");
connectDB();

// Middleware
app.use(express.json());
app.use(logger("tiny"));
app.use(cors());

// Initial
app.get("/", (req, res) => {
  res.json({
    message: `Server is running`,
    title: "Welcome to social media app API",
  });
});

// Routes -
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);

// Error Handlers (middlewares) -
app.use(notFound);
app.use(errorMiddleware);

// Server connection
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is up on http://localhost:${PORT}`);
});
