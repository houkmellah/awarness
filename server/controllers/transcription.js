// controllers/transcription.js

const fs = require("fs");
const path = require("path");
const { SpeechClient } = require("@google-cloud/speech");
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '..', 'creditsGoogleToSpeech.json');
const speech = new SpeechClient();

exports.createTranscription = async (req, res) => {
  try {
    // Vérification plus détaillée de la requête
    console.log("Contenu de req.body :", req.body);
    console.log("Contenu de req.files :", req.files);
    console.log("Contenu de req.file :", req.file);
    
    if (!req.body && !req.files) {
      throw new Error("Aucune donnée n'a été reçue dans la requête");
    }

    // Initialiser le client Storage
    const storage = new Storage();
    const bucketName = 'awarness'; // Remplacez par votre nom de bucket
    const bucket = storage.bucket(bucketName);
    
    // Créer un nom de fichier unique
    const fileName = `temp-audio-${uuidv4()}.webm`;
    const file = bucket.file(fileName);

    // Uploader le fichier audio
    let audioBuffer;
    if (req.file) {
      audioBuffer = req.file.buffer;
    } else if (req.files && req.files.file) {
      audioBuffer = req.files.file.data;
    } else {
      audioBuffer = Buffer.from(req.body.file, 'base64');
    }

    await file.save(audioBuffer);
    
    // Modifier la configuration pour utiliser GCS
    const audio = {
      uri: `gs://${bucketName}/${fileName}`
    };

    const config = {
      encoding: "WEBM",
      sampleRateHertz: 48000,
      languageCode: "FR",
      // alternativeLanguageCodes: ["ar-AR"],
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
      model: "default",
      maxAlternatives: 1,
      audioChannelCount: 1
    };

    const request = { audio: audio, config: config };

    // Lancer la transcription de manière asynchrone
    const [operation] = await speech.longRunningRecognize(request);
    const [response] = await operation.promise();

    let transcription = "";
    response.results.forEach((result, index) => {
      const alternative = result.alternatives[0];
      if (alternative && alternative.transcript) {
        transcription += alternative.transcript + "\n";
        // Afficher également les timestamps du premier mot si disponibles
        if (alternative.words && alternative.words.length > 0) {
          const startTime = alternative.words[0].startTime.seconds || 0;
          const endTime = alternative.words[alternative.words.length - 1].endTime.seconds || 0;
          console.log(`Segment ${index + 1} [${startTime}s - ${endTime}s]: ${alternative.transcript}`);
        } else {
          console.log(`Segment ${index + 1} de transcription: ${alternative.transcript}`);
        }
      } else {
        console.log(`Segment ${index + 1} vide ou sans transcription`);
      }
    });

    console.log("Transcription complétée. Nombre de segments :", response.results.length);
    console.log("Transcription finale :\n", transcription);
    // Après avoir obtenu la réponse de l'API
console.log("Réponse complète de l'API :\n", JSON.stringify(response.results, null, 2));

    // Nettoyer le fichier après utilisation
    await file.delete();

    res.json({ text: transcription });
  } catch (error) {
    console.error("Erreur lors de la transcription :", error);
    res.status(500).json({ error: error.message });
  }
};
