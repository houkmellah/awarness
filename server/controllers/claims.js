const Claim = require("../models/claim");

const createClaim = async (req, res) => {
    const { title, description } = req.body;
    const newClaim = new Claim({ title, description, createdBy: req.userId });
    await newClaim.save();
    res.status(201).json(newClaim);
};

const getClaims = async (req, res) => {
    const claims = await Claim.find({ createdBy: req.userId });
    res.status(200).json(claims);
};

const updateClaim = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const updatedClaim = await Claim.findByIdAndUpdate(id, { title, description }, { new: true });
    res.status(200).json(updatedClaim);
};

const deleteClaim = async (req, res) => {
    const { id } = req.params;
    await Claim.findByIdAndDelete(id);
    res.status(204).send();
};

const getClaimsByUser = async (req, res) => {
    const claims = await Claim.find({ createdBy: req.userId });
    res.status(200).json(claims);
};

module.exports = { createClaim, getClaims, updateClaim, deleteClaim, getClaimsByUser };
