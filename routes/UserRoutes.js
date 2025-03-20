const express = require("express");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const { protect } = require("../middlewares/authMiddleware");

const userRouter = express.Router();

// Register route
userRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Check if user already register
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
    }
    // Create new user
    const user = await User.create({
      username,
      email,
      password,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User login
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user by Id
userRouter.get("/:userId", protect, async (req, res) => {
  try {
    const listingQuery = { _id: req.params.userId };
    const user = await User.findOne(listingQuery);
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = userRouter;
