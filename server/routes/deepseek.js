const express = require('express');
const router = express.Router();
const {  processText } = require('../controllers/deepseek');


const authMiddleware = require('../middlewares/auth');
// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Route pour réécrire du texte
router.post('/deepseek/rewrite', processText);

module.exports = { router, protected: true };
