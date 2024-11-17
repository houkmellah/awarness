const express = require("express");
const router = express.Router();
const { createEmotion, getEmotions } = require("../controllers/emotions");
const authMiddleware = require("../middlewares/auth");

router.use(authMiddleware);

router.post("/emotions", createEmotion);
router.get("/emotions", getEmotions);

module.exports = { router, protected: true };
