const cors = require("cors");
const fs = require("fs");
const express = require("express");
const mogoose = require("mongoose");
const morgan = require("morgan");
const { default: mongoose } = require("mongoose");
const authMiddleware = require("./middlewares/auth");
require("dotenv").config();
console.log(process.env.DATABASE);

// Create express app
const app = express();

//DB
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB connection error", err));
  
// Apply middlewares
app.use(cors({
  origin: ["awarness.vercel.app"],

}));
app.use(express.json());
app.use(morgan("dev"));
app.use((req, res, next) => {
  next();
});


fs.readdirSync("./routes").forEach((r) => {
  try {
    const route = require(`./routes/${r}`);
    
    // Créer un nouveau router pour ce fichier de route
    const fileRouter = express.Router();
    
    // Appliquer les routes du fichier à ce nouveau router
    route.router.stack.forEach((layer) => {
      if (layer.route) {
        const path = layer.route.path;
        const method = Object.keys(layer.route.methods)[0];
        
        if (route.protected === true) {
          // Si la route est protégée, appliquer le middleware d'authentification
          fileRouter[method](path, authMiddleware, layer.route.stack[0].handle);
        } else {
          // Sinon, appliquer la route sans le middleware d'authentification
          fileRouter[method](path, layer.route.stack[0].handle);
        }
      }
    });
    
    // Appliquer le nouveau router à l'application
    app.use("/api", fileRouter);
  } catch (error) {
    console.error(`Error loading route ${r}:`, error);
  }
});


// Remplacez la partie d'écoute du serveur par ceci :
if (process.env.VERCEL) {
  // Exportez l'application pour Vercel
  module.exports = app;
} else {
  // Démarrez le serveur normalement pour le développement local
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
  });
}
