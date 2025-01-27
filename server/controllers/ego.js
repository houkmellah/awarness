const Ego = require('../models/ego');

module.exports = {
    createEgo
}   

async function createEgo(req, res) {
    const { message, response, note } = req.body;
    const ego = new Ego({ message, response, note });
    await ego.save();
    res.status(201).json(ego);
}

const getEgo = async (req, res) => {
    const ego = await Ego.find();
    res.status(200).json(ego);
}

const updateEgo = async (req, res) => {
    console.log("Request Params ===>", req.body)
    const { id } = req.params;
    const { message, response, note } = req.body;
    const ego = await Ego.findByIdAndUpdate(id, { message, response, note });
    console.log("ego ===>", ego)
    res.status(200).json(ego);
}

const deleteEgo = async (req, res) => {
    const { id } = req.params;
    const ego = await Ego.findByIdAndDelete(id);
    res.status(200).json(ego);
}

const getEgosByNote = async (req, res) => {
    try {
        const { note } = req.params;
        
        if (!note) {
            return res.status(400).json({ 
                message: "L'identifiant de la note est requis" 
            });
        }

        const egos = await Ego.find({ note: note })
            .sort({ createdAt: -1 }); // Trie par date de création décroissante
        
        if (!egos || egos.length === 0) {
            return res.status(404).json({ 
                message: "Aucun ego trouvé pour cette note" 
            });
        }

        res.status(200).json(egos);
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de la récupération des egos",
            error: error.message 
        });
    }
}

module.exports = {
    createEgo,
    getEgo,
    updateEgo,
    deleteEgo,
    getEgosByNote
}
