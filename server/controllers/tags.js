const Tag = require("../models/tags.js");

// Créer un nouveau tag
const createTag = async (req, res) => {
  const { name } = req.body;
  const newTag = new Tag({
    name,
    color,
    user: req.userId,
  });
  try {
    await newTag.save();
    res.status(201).json(newTag);
  } catch (error) {
    res.status(400).json({ message: "Échec de la création du tag", error: error.message });
  }
};

// Obtenir tous les tags pour l'utilisateur authentifié
const getTags = async (req, res) => {
  try {
    const tags = await Tag.find({ user: req.userId });
    res.status(200).json(tags);
  } catch (error) {
    console.error("Erreur dans getTags:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir un tag spécifique par ID
const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findOne({ _id: req.params.id, user: req.userId });
    if (!tag) {
      return res.status(404).json({ message: "Tag non trouvé" });
    }
    res.status(200).json(tag);
  } catch (error) {
    res.status(500).json({ message: "Échec de la récupération du tag", error: error.message });
  }
};

// Mettre à jour un tag
const updateTag = async (req, res) => {
  const { name } = req.body;
  try {
    const updatedTag = await Tag.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, color },
      { new: true }
    );
    if (!updatedTag) {
      return res.status(404).json({ message: "Tag non trouvé" });
    }
    res.status(200).json(updatedTag);
  } catch (error) {
    res.status(400).json({ message: "Échec de la mise à jour du tag", error: error.message });
  }
};

// Supprimer un tag
const deleteTag = async (req, res) => {
  try {
    const deletedTag = await Tag.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!deletedTag) {
      return res.status(404).json({ message: "Tag non trouvé" });
    }
    res.status(200).json({ message: "Tag supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Échec de la suppression du tag", error: error.message });
  }
};

module.exports = { createTag, getTags, getTagById, updateTag, deleteTag };