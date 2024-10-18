const People = require("../models/people.js");

// Create a new person
const createPerson = async (req, res) => {
  const { firstName, secondName, nickName } = req.body;
  const newPerson = new People({
    firstName,
    secondName,
    nickName,
    user: req.userId, // Add the user ID from the authenticated request
  });
  try {
    await newPerson.save();
    res.status(201).json(newPerson);
  } catch (error) {
    res.status(400).json({ message: "Failed to create person", error: error.message });
  }
};

// Get all people for the authenticated user
const getPeople = async (req, res) => {
  try {
    const people = await People.find({ user: req.userId });
    res.status(200).json(people);
  } catch (error) {
    console.error("Error in getPeople:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a specific person by ID
const getPersonById = async (req, res) => {
  try {
    const person = await People.findOne({ _id: req.params.id, user: req.userId });
    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }
    res.status(200).json(person);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch person", error: error.message });
  }
};

// Update a person
const updatePerson = async (req, res) => {
  const { firstName, secondName, nickName } = req.body;
  try {
    const updatedPerson = await People.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { firstName, secondName, nickName },
      { new: true }
    );
    if (!updatedPerson) {
      return res.status(404).json({ message: "Person not found" });
    }
    res.status(200).json(updatedPerson);
  } catch (error) {
    res.status(400).json({ message: "Failed to update person", error: error.message });
  }
};

// Delete a person
const deletePerson = async (req, res) => {
  try {
    const deletedPerson = await People.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!deletedPerson) {
      return res.status(404).json({ message: "Person not found" });
    }
    res.status(200).json({ message: "Person deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete person", error: error.message });
  }
};

module.exports = { createPerson, getPeople, getPersonById, updatePerson, deletePerson };