const Belief = require("../models/belief");

const createBelief = async (req, res) => {
    try {
        const { belief, belielLevel, mirrorBelief, mirrorBeliefReason, mirrorResponse } = req.body;
        const newBelief = new Belief({ 
            belief, 
            belielLevel, 
            mirrorBelief, 
            mirrorBeliefReason, 
            mirrorResponse, 
            createdBy: req.userId 
        });
        await newBelief.save();
        res.status(201).json(newBelief);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBeliefs = async (req, res) => {
    try {
        const beliefs = await Belief.find({ createdBy: req.userId });
        res.status(200).json(beliefs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBelief = async (req, res) => {
    try {
        const { id } = req.params;
        const { belief, belielLevel, mirrorBelief, mirrorBeliefReason, mirrorResponse } = req.body;
        const updatedBelief = await Belief.findByIdAndUpdate(
            id, 
            { belief, belielLevel, mirrorBelief, mirrorBeliefReason, mirrorResponse }, 
            { new: true }
        );
        res.status(200).json(updatedBelief);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBelief = async (req, res) => {
    try {
        const { id } = req.params;
        await Belief.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBeliefById = async (req, res) => {
    try {
        const { id } = req.params;
        const belief = await Belief.findById(id);
        if (!belief) {
            return res.status(404).json({ message: "Croyance non trouvée" });
        }
        res.status(200).json(belief);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createBelief, 
    getBeliefs, 
    updateBelief, 
    deleteBelief, 
    getBeliefById 
};
