const express = require("express");
const router = express.Router();
const { createClaim, getClaims, updateClaim, deleteClaim, getClaimsByUser } = require("../controllers/claims");

router.get("/claims/user/:id", getClaimsByUser);
router.put("/claims/:id", updateClaim);
router.delete("/claims/:id", deleteClaim);
router.post("/claims", createClaim);
router.get("/claims", getClaims);

module.exports = { router, protected: true };