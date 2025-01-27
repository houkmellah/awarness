const Expectation = require("../models/expectation.js");

const createExpectation = async (req, res) => {
    const { name , createdBy } = req.body;
    const expectation = await Expectation.create({ name , createdBy });
    res.status(200).json(expectation);
}


 const getExpectations = async (req, res) => {
    const expectations = await Expectation.find();
    res.status(200).json(expectations);
}

 const updateExpectation = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const expectation = await Expectation.findByIdAndUpdate(id, { name });
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

module.exports = { createExpectation, getExpectations, updateExpectation, deleteExpectation, getExpectationsByNote, getExpectationsByUser };

