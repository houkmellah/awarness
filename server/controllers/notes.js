const Note = require("../models/notes.js");

// Create a new note
const createNote = async (req, res) => {
  const { note, date, rating, lifeAspect, people, tags, emotions } = req.body;
  const newNote = new Note({
    note,
    date,
    rating,
    lifeAspect,
    people,
    tags,
    user: req.userId,
    emotions,
  });

  try {
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create note", error: error.message });
  }
};

// Get all notes for the authenticated user
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId })
      .populate('people', 'firstName secondName nickName');
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getNotes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a specific note by ID
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json(note);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch note", error: error.message });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete note", error: error.message });
  }
};

// Update a note
const updateNote = async (req, res) => {
  const { note, date, rating, lifeAspect, people, tags, emotions } = req.body;
  console.log(req.body);
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId},
      { note, date, rating, lifeAspect, people, tags, emotions},
      { new: true }
    );
    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json(updatedNote);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update note", error: error.message });
  }
};

// Get notes by life aspect
const getNotesByLifeAspect = async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.req.userId,
      lifeAspect: req.params.lifeAspect,
    });
    res.status(200).json(notes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch notes", error: error.message });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getNotesByLifeAspect,
};
