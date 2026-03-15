import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("NUM90 API fonctionne");
});

app.get("/resultats", async (req, res) => {

  try {

    const response = await axios.get(
      "https://lotobonheur.ci/wp-json/wp/v2/posts"
    );

    const data = response.data;

    res.json({
      source: "lotobonheur.ci",
      data: data[0]
    });

  } catch (error) {

    res.json({
      erreur: "Impossible de récupérer les résultats"
    });

  }

});

app.listen(PORT, () => {
  console.log("Serveur lancé sur le port " + PORT);
});
