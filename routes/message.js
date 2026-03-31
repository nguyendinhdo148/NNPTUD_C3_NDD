const express = require("express");
const router = express.Router();

const messageController = require("../controllers/message.controller");
const { CheckLogin } = require("../utils/authHandler");

// lấy chat giữa 2 user
router.get("/:userId", CheckLogin, messageController.getMessagesWithUser);

// gửi message
router.post("/", CheckLogin, messageController.sendMessage);

// lấy danh sách chat (message cuối)
router.get("/", CheckLogin, messageController.getLastMessages);

module.exports = router;