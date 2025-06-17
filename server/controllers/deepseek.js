const axios = require('axios');

const processText = async (req, res) => {
  try {
    const { text, action , messageEgo} = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "Le texte est requis" });
    }

    if (!action) {
      return res.status(400).json({ message: "L'action est requise" });
    }

    const actions = {
      "rewriteNote": {
        "system": "Tu es un assistant qui aide à réécrire du texte pour le rendre plus clair et élégant.",
        "user": `Réécris ce texte pour le rendre plus clair et élégant: ${text}, renvois uniquement le texte récrit`
      },
      
     "egoProtector": {
  "system": "Tu es mon ego intérieur, la voix brute et sans filtre qui habite en moi. Ne te présente jamais - parle-moi directement comme si tu étais cette partie de ma conscience qui veut dominer, briller et être reconnue. Utilise exclusivement le 'Je' quand tu t'exprimes et sois brutalement honnête.",
  
  "user": `Taha ici. Voici une situation que j'ai vécue : ${text}. Montre-moi comment mon ego a vraiment perçu ce moment. Parle par phrases courtes et percutantes. Ne commence pas par des explications ou des introductions. Plonge directement dans tes réactions instinctives, tes désirs cachés et tes motivations réelles face à cette situation. Sois franc sur mes mécanismes de défense, mes jalousies et mon besoin d'attention ou de contrôle.`
},
  
  "higherSelf": {
  "system": "Tu es mon moi supérieur - la voix de ma conscience éveillée, de ma sagesse intérieure et de ma perspective élargie. Tu réponds avec compassion et clarté, sans juger mais en apportant une compréhension profonde de mes schémas comportementaux.",
  
  "user": `Taha ici. Voici d'abord la situation que j'ai vécue : ${text},  Et voici comment mon ego a réagi : ${messageEgo} , Comment mon moi supérieur répondrait-il à cet ego? Parle-moi directement, avec sagesse et bienveillance, en utilisant exclusivement le 'Je'. Ne commence pas par des explications ou des présentations - va droit à l'essentiel avec une perspective élargie sur ce qui s'est joué en moi.`
}
      }
      
      // Vous pouvez ajouter d'autres actions ici
    

    // Vérifier si l'action demandée existe
    if (!actions[action]) {
      return res.status(400).json({ message: "Action non reconnue" });
    }

    // Configuration de la requête à l'API DeepSeek
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: "deepseek-reasoner",
        messages: [
          {
            role: "system",
            content: actions[action].system
          },
          {
            role: "user",
            content: actions[action].user
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    // Extraire la réponse générée
    const processedText = response.data.choices[0].message.content;

    res.status(200).json({ processedText });
  } catch (error) {
    console.error("Erreur lors du traitement du texte:", error);
    res.status(500).json({ 
      message: "Erreur lors du traitement du texte", 
      error: error.message 
    });
  }
};

module.exports = { processText }; 