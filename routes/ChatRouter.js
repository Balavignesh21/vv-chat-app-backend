const express = require("express");
const Message = require("../models/ChatModel");
const { protect } = require("../middlewares/authMiddleware");

const chatRouter = express.Router();

// Send message
chatRouter.post("/", protect, async (req, res) => {
  try {
    const { content, groupId } = req.body;
    const message = await Message.create({
      sender: req.user._id,
      content,
      group: groupId,
    });
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username email"
    );
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get messages for a group
chatRouter.get("/:groupId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate("sender", "username email")
      .sort({ createdAt: 1 });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = chatRouter;
