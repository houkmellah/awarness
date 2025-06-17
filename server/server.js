const cors = require("cors");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const authMiddleware = require("./middlewares/auth");
const path = require("path");
require("dotenv").config();

// Création de l'application Express
const app = express();

// Middleware de logging personnalisé (optionnel)
app.use((req, res, next) => {
  // Vous pouvez activer ces logs pour débugger
  // console.log('Path:', req.path);
  // console.log('Origin:', req.get('origin') || 'No origin');
  next();
});

// Connexion à la base de données MongoDB
mongoose
  .connect(process.env.DATABASE, {
    // Vous pouvez ajouter d'autres options ici si besoin
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB connection error", err));

// Configuration du CORS
app.use(
  cors({
    origin: [process.env.ORIGIN_URL],
  })
);

// Middleware pour parser le JSON
app.use(express.json());

// Middleware de logging HTTP
app.use(morgan("dev"));

// Un middleware générique (optionnel)
app.use((req, res, next) => {
  next();
});

// Chargement dynamique des routes depuis le dossier "routes"
const routesPath = path.join(__dirname, "routes");
if (fs.existsSync(routesPath)) {
  fs.readdirSync(routesPath).forEach((r) => {
    try {
      console.log("Chargement de la route :", r);
      const route = require(path.join(routesPath, r));

      // Créer un nouveau router pour ce fichier de route
      const fileRouter = express.Router();

      // Parcourir la stack de middleware du router exporté
      route.router.stack.forEach((layer) => {
        if (layer.route) {
          const routePath = layer.route.path;
          // Récupérer la méthode (ex: "post", "get", etc.)
          const method = Object.keys(layer.route.methods)[0];

          // Récupérer TOUS les middlewares de cette route
          const handlers = layer.route.stack.map((l) => l.handle);

          // Appliquer le middleware d'authentification si la route est protégée
          if (route.protected === true) {
            fileRouter[method](routePath, authMiddleware, ...handlers);
          } else {
            fileRouter[method](routePath, ...handlers);
          }
        }
      });

      // Monter le router avec le préfixe "/api"
      app.use("/api", fileRouter);
    } catch (error) {
      console.error(`Erreur lors du chargement de la route ${r}:`, error);
    }
  });
} else {
  console.warn("Le répertoire 'routes' n'existe pas.");
}

// Démarrage de l'application ou export pour Vercel
if (process.env.VERCEL) {
  // Pour un déploiement sur Vercel
  module.exports = app;
} else {
  // Pour le développement local
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
  });
}
