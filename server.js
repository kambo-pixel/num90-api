import express from "express";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("NUM90 API fonctionne");
});

app.get("/resultats", async (req, res) => {

  try {

    const url = "https://lotobonheur.ci/resultats";

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const texte = $("body").text();

    const numeros = texte.match(/\b\d{1,2}\b/g);

    res.json({
      source: "lotobonheur.ci",
      total: numeros.length,
      tirage: numeros
    });

  } catch (error) {

    res.json({
      erreur: "Impossible de récupérer les résultats",
      details: error.message
    });

  }

});

app.listen(PORT, () => {
  console.log("Serveur lancé sur le port " + PORT);
});
