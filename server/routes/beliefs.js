const express = require("express");
const router = express.Router();
const {
  createBelief,
  getBeliefs,
  updateBelief,
  deleteBelief,
  getBeliefById
} = require("../controllers/beliefs");

router.post("/beliefs", createBelief);
router.get("/beliefs", getBeliefs);
router.get("/beliefs/:id", getBeliefById);
router.put("/beliefs/:id", updateBelief);
router.delete("/beliefs/:id", deleteBelief);

module.exports = { router, protected: true };
