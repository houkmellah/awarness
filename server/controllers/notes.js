const Note = require("../models/notes.js");
const Tag = require("../models/tags.js");
const mongoose = require("mongoose");

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeTags = (tags = []) => {
  if (!Array.isArray(tags)) return [];

  const seen = new Set();
  const output = [];

  for (const rawTag of tags) {
    if (typeof rawTag !== "string") continue;
    const cleaned = rawTag.trim();
    if (!cleaned) continue;

    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(cleaned);
  }

  return output;
};

const isLikelyObjectIdString = (value = "") => /^[a-fA-F0-9]{24}$/.test(value);

// Create a new note
const createNote = async (req, res) => {
  const { note, date, rating, lifeAspect, people, tags, emotions , expectations , claims , fears, beliefs  } = req.body;
  const newNote = new Note({
    note,
    date,
    rating,
    lifeAspect,
    people,
    tags: normalizeTags(tags),
    user: req.userId,
      emotions,
    expectations,
claims,
fears,
beliefs
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
      .populate('people', 'firstName secondName nickName')
      .populate('beliefs', 'belief belielLevel');
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
  const { note, date, rating, lifeAspect, people, tags, emotions , expectations , claims , fears, beliefs} = req.body;
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId},
      {
        note,
        date,
        rating,
        lifeAspect,
        people,
        tags: normalizeTags(tags),
        emotions,
        expectations,
        claims,
        fears,
        beliefs,
      },
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

// Get tag suggestions from the authenticated user's existing notes
const getTagSuggestions = async (req, res) => {
  try {
    const userObjectId = mongoose.Types.ObjectId.isValid(req.userId)
      ? new mongoose.Types.ObjectId(req.userId)
      : null;

    if (!userObjectId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const query = (req.query.q || "").trim();
    const parsedLimit = Number(req.query.limit);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 50)
        : 20;

    const pipeline = [
      {
        $match: {
          user: userObjectId,
          tags: { $exists: true, $ne: [] },
        },
      },
      { $unwind: "$tags" },
      {
        $project: {
          normalizedTag: { $trim: { input: "$tags" } },
        },
      },
      {
        $match: {
          normalizedTag: { $ne: "" },
        },
      },
    ];

    if (query) {
      pipeline.push({
        $match: {
          normalizedTag: {
            $regex: new RegExp(escapeRegex(query), "i"),
          },
        },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: { $toLower: "$normalizedTag" },
          name: { $first: "$normalizedTag" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, name: 1 } },
      { $project: { _id: 0, name: 1, count: 1 } }
    );

    const noteSuggestions = await Note.aggregate(pipeline);
    const legacyTags = await Tag.find({ user: req.userId }).select("name -_id");

    const merged = new Map();

    for (const item of noteSuggestions) {
      const tagName = typeof item.name === "string" ? item.name.trim() : "";
      if (!tagName || isLikelyObjectIdString(tagName)) continue;

      const key = tagName.toLowerCase();
      merged.set(key, {
        name: tagName,
        count: Number(item.count) || 0,
      });
    }

    for (const tag of legacyTags) {
      const tagName = typeof tag.name === "string" ? tag.name.trim() : "";
      if (!tagName) continue;

      const key = tagName.toLowerCase();
      if (merged.has(key)) {
        merged.get(key).count += 1;
      } else {
        merged.set(key, { name: tagName, count: 1 });
      }
    }

    const suggestions = Array.from(merged.values())
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, limit);

    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tag suggestions",
      error: error.message,
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getNotesByLifeAspect,
  getTagSuggestions,
};
