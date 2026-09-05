const mongoose = require("mongoose");
const Expectation = require("../models/expectation.js");
const Note = require("../models/notes.js");

const createExpectation = async (req, res) => {
    const { name , reason, createdBy } = req.body;
    const expectation = await Expectation.create({ name , reason, createdBy });
    res.status(200).json(expectation);
}


 const getExpectations = async (req, res) => {
    const expectations = await Expectation.find();
    res.status(200).json(expectations);
}

 const updateExpectation = async (req, res) => {
    const { id } = req.params;
    const { name, reason } = req.body;
    const expectation = await Expectation.findByIdAndUpdate(id, { name, reason });
    res.status(200).json(expectation);
}

 const deleteExpectation = async (req, res) => {
    const { id } = req.params;
    const expectation = await Expectation.findByIdAndDelete(id);
    res.status(200).json(expectation);
}

 const getExpectationsByNote = async (req, res) => {
    const { noteId } = req.params;
    const expectations = await Expectation.find({ note: noteId });
    res.status(200).json(expectations);
}

const getExpectationsByUser = async (req, res) => {
    console.log("User id", req.params.userId)
    const { userId } = req.params;
    const expectations = await Expectation.find({ createdBy: userId });
    res.status(200).json(expectations);
}

const getExpectationsByUserWithUsage = async (req, res) => {
    try {
        const { userId } = req.params;
        const authUserId = req.userId;
        if (!authUserId || authUserId !== userId) {
            return res.status(403).json({ message: "Accès non autorisé" });
        }

        const usageCounts = await Note.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(authUserId) } },
            { $unwind: "$expectations" },
            { $group: { _id: "$expectations", count: { $sum: 1 } } },
        ]);

        const countMap = new Map(
            usageCounts.map((u) => [u._id.toString(), u.count])
        );

        const expectations = await Expectation.find({ createdBy: userId }).lean();
        const withUsage = expectations.map((exp) => ({
            ...exp,
            usageCount: countMap.get(exp._id.toString()) || 0,
        }));

        res.status(200).json(withUsage);
    } catch (error) {
        console.error("Erreur getExpectationsByUserWithUsage:", error);
        res.status(500).json({
            message: "Erreur lors du chargement des attentes",
            error: error.message,
        });
    }
};

const getExpectationsSortedByUsage = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Non authentifié" });
        }

        const usageCounts = await Note.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $unwind: "$expectations" },
            { $group: { _id: "$expectations", count: { $sum: 1 } } },
        ]);

        const countMap = new Map(
            usageCounts.map((u) => [u._id.toString(), u.count])
        );

        const expectations = await Expectation.find().lean();
        const sorted = expectations
            .map((exp) => ({
                ...exp,
                usageCount: countMap.get(exp._id.toString()) || 0,
            }))
            .sort((a, b) => b.usageCount - a.usageCount);

        res.status(200).json(sorted);
    } catch (error) {
        console.error("Erreur getExpectationsSortedByUsage:", error);
        res.status(500).json({
            message: "Erreur lors du chargement des attentes",
            error: error.message,
        });
    }
};

module.exports = {
    createExpectation,
    getExpectations,
    updateExpectation,
    deleteExpectation,
    getExpectationsByNote,
    getExpectationsByUser,
    getExpectationsByUserWithUsage,
    getExpectationsSortedByUsage,
};

