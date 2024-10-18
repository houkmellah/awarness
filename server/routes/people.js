const express = require("express");
const router = express.Router();
const {
  createPerson,
  getPeople,
  getPersonById,
  updatePerson,
  deletePerson
} = require("../controllers/people");
const authMiddleware = require("../middlewares/auth");

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Routes protégées
router.post("/people", createPerson);
router.get("/people", getPeople);
router.get("/people/:id", getPersonById);
router.put("/people/:id", updatePerson);
router.delete("/people/:id", deletePerson);

// Indiquer que ces routes sont protégées
module.exports = { router, protected: true };