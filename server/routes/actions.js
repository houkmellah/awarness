const express = require("express");
const router = express.Router();
const { createAction, getActions, deleteAction, updateAction } = require("../controllers/actions");
const authMiddleware = require("../middlewares/auth");

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Routes protégées
router.post("/actions", createAction);
router.get("/actions", getActions);
router.delete("/actions/:id", deleteAction);
router.put("/actions/:id", updateAction);

// Indiquer que ces routes sont protégées
module.exports = { router, protected: true };