const express = require("express");
const router = express.Router();
const {
  createFear,
  getFears,
  updateFear,
  deleteFear,
  getFearsByUser,
} = require("../controllers/fears");

router.get("/fears/user/:id", getFearsByUser);
router.put("/fears/:id", updateFear);
router.delete("/fears/:id", deleteFear);
router.post("/fears", createFear);
router.get("/fears", getFears);

module.exports = { router, protected: true };
