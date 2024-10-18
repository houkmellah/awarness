const Action = require("../models/actions.js");

const createAction = async (req, res) => {
  const { action, type, date, rating } = req.body;

  const newAction = new Action({
    action,
    date,
    type,
    rating,
  });

  try {
    await newAction.save();
    res.status(201).json(newAction);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

const getActions = async (req, res) => {
  try {
    const actions = await Action.find();
    res.status(200).json(actions);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
const deleteAction = async (req, res) => {
  const { id } = req.params;

  try {
    await Action.findByIdAndDelete(id);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateAction = async (req, res) => {
  const { id } = req.params;
  const { action, type, date, rating } = req.body;

  try {
    const updatedAction = await Action.findByIdAndUpdate(
      id,
      { action, type, date, rating },
      { new: true }
    );
    res.status(200).json(updatedAction);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = { createAction, getActions, updateAction, deleteAction };
