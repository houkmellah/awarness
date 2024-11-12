const Emotions           = require("../models/emotions.js");

// Create a new emotion
const createEmotion = async (req, res) => {
  try{
    const { category, name, description, message, guidance } = req.body;
    const newEmotion = new Emotions({ category, name, description, message, guidance });
    await newEmotion.save();
    res.status(201).json(newEmotion);
  } catch (error) {
    res.status(500).json({ message: "Failed to create emotion", error: error.message });
  }
};  

// Get all emotions
const getEmotions = async (req, res) => {
  try{
    const emotions = await Emotions.find();
    res.status(200).json(emotions);
  } catch (error) {
    res.status(500).json({ message: "Failed to get emotions", error: error.message });
  }
};

module.exports = { createEmotion, getEmotions };
