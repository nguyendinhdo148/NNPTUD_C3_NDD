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
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ from: currentUserId }, { to: currentUserId }],
          isDeleted: false,
        },
      },
      {
        $addFields: {
          user: {
            $cond: [
              { $eq: ["$from", currentUserId] },
              "$to",
              "$from",
            ],
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$user",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$lastMessage" } },

      {
        $lookup: {
          from: "users",
          localField: "from",
          foreignField: "_id",
          as: "from",
        },
      },
      { $unwind: "$from" },

      {
        $lookup: {
          from: "users",
          localField: "to",
          foreignField: "_id",
          as: "to",
        },
      },
      { $unwind: "$to" },

      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};