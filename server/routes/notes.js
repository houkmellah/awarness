const express = require("express");
const router = express.Router();
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getNotesByLifeAspect
} = require("../controllers/notes");
const authMiddleware = require("../middlewares/auth");

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Routes protégées
router.post("/notes", createNote);
router.get("/notes", getNotes);
router.get("/notes/:id", getNoteById);
router.put("/notes/:id", updateNote);
router.delete("/notes/:id", deleteNote);
router.get("/notes/aspect/:lifeAspect", getNotesByLifeAspect);

// Indiquer que ces routes sont protégées
module.exports = { router, protected: true };