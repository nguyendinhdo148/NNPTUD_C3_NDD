const Message = require("../schemas/message.model");
const mongoose = require("mongoose");

// ==============================
// GET /messages/:userId
// ==============================
exports.getMessagesWithUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId },
      ],
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .populate("from to", "username avatarUrl");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// POST /messages
// ==============================
exports.sendMessage = async (req, res) => {
  try {
    const from = req.user._id;
    const { to, messageContent } = req.body;

    if (!to) {
      return res.status(400).json({ message: "Missing to userId" });
    }

    if (!messageContent || !messageContent.type || !messageContent.text) {
      return res.status(400).json({ message: "messageContent.type and messageContent.text are required" });
    }

    const type = messageContent.type;
    const text = messageContent.text;

    if (type !== "text" && type !== "file") {
      return res.status(400).json({ message: "messageContent.type must be 'text' or 'file'" });
    }

    const payload = {
      from,
      to,
      messageContent: {
        type,
        text,
      },
    };

    const newMessage = await Message.create(payload);

    const populated = await newMessage.populate(
      "from to",
      "username avatarUrl"
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// GET /messages
// ==============================
exports.getLastMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // 1. Lấy tất cả message liên quan
    const messages = await Message.find({
      $or: [{ from: currentUserId }, { to: currentUserId }],
      isDeleted: false,
    })
      .sort({ createdAt: -1 }) // mới nhất lên đầu
      .populate("from")
      .populate("to");

    // 2. Map để lưu last message theo từng user
    const conversationMap = new Map();

    for (let msg of messages) {
      // xác định người còn lại
      const otherUser =
        msg.from._id.toString() === currentUserId.toString()
          ? msg.to._id.toString()
          : msg.from._id.toString();

      // nếu chưa có thì lấy (vì đã sort rồi nên cái đầu là mới nhất)
      if (!conversationMap.has(otherUser)) {
        conversationMap.set(otherUser, msg);
      }
    }

    // 3. convert ra array
    const result = Array.from(conversationMap.values());

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};