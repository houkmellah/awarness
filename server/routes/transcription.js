const express = require("express");
const router = express.Router();
const { createTranscription } = require("../controllers/transcription");
const authMiddleware = require("../middlewares/auth");
const multer = require("multer");

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);



// // Configuration de Multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // limite à 10MB
  }
});

// Route avec middleware Multer
router.post("/transcription", upload.single('audio'), async (req, res, next) => {
  try {
    await createTranscription(req, res);
  } catch (error) {
    next(error);
  }
});

// router.post("/transcription", createTranscription)


// Important : exporter à la fois le router et l'information sur la protection
module.exports = {
  router,
  protected: true  // true si vous voulez que la route soit protégée par authMiddleware
}; 