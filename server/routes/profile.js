const express = require("express");
const router = express.Router();
const { register, login, getProfile, forgotPassword, resetPassword } = require("../controllers/auth");
const authMiddleware = require("../middlewares/auth");

// Routes publiques
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Route protégée
router.get("/profile", authMiddleware, getProfile);

module.exports = {
  router,
  protected: false  // Ce router contient des routes mixtes (protégées et non protégées)
};