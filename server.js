import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("NUM90 API fonctionne");
});

app.get("/resultats", async (req, res) => {

  try {

    const response = await axios.get(
      "https://lotobonheur.ci/resultats",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9",
          "Connection": "keep-alive"
        }
      }
    );

    const html = response.data;

    const $ = cheerio.load(html);

    const texte = $("body").text();

    const numeros = texte.match(/\b\d{1,2}\b/g);

    res.json({
      source: "lotobonheur",
      total: numeros ? numeros.length : 0,
      tirage: numeros || []
    });

  } catch (error) {

    res.json({
      erreur: "Impossible de récupérer les résultats",
      message: error.message
    });

  }

});

app.listen(PORT, () => {
  console.log("Serveur lancé sur le port " + PORT);
});
