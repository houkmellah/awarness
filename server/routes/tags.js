const express = require("express");
const router = express.Router();
const {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag
} = require("../controllers/tags");
const authMiddleware = require("../middlewares/auth");

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Routes protégées
router.post("/tags", createTag);
router.get("/tags", getTags);
router.get("/tags/:id", getTagById);
router.put("/tags/:id", updateTag);
router.delete("/tags/:id", deleteTag);

// Indiquer que ces routes sont protégées
module.exports = { router, protected: true };