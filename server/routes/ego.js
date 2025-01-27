const express = require('express');
const router = express.Router();

const { createEgo, getEgo, updateEgo, deleteEgo, getEgosByNote } = require('../controllers/ego');


const authMiddleware = require("../middlewares/auth");

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);


router.post('/ego', createEgo);
router.get('/ego', getEgo);
router.get('/ego/note/:note', getEgosByNote);
router.put('/ego/:id', updateEgo);
router.delete('/ego/:id', deleteEgo);

module.exports = { router, protected: true };
