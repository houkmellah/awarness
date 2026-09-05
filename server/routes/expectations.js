const express = require("express");
const router = express.Router();
const {
    createExpectation,
    getExpectations,
    updateExpectation,
    deleteExpectation,
    getExpectationsByNote,
    getExpectationsByUser,
    getExpectationsByUserWithUsage,
    getExpectationsSortedByUsage,
} = require("../controllers/expectations");
const authMiddleware = require("../middlewares/auth");

router.use(authMiddleware);

router.get("/expectations/note/:noteId", getExpectationsByNote);
router.get("/expectations/user/:userId/with-usage", getExpectationsByUserWithUsage);
router.get("/expectations/user/:userId", getExpectationsByUser);
router.get("/expectations/sorted-by-usage", getExpectationsSortedByUsage);
router.get("/expectations", getExpectations);
router.post("/expectations", createExpectation);
router.put("/expectations/:id", updateExpectation);
router.delete("/expectations/:id", deleteExpectation);

module.exports = { router, protected: true };
