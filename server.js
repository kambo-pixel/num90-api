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

    let numeros = [];

    $(".ball, .number, .result").each((i, el) => {
      const num = $(el).text().trim();
      if (num) numeros.push(num);
    });

    res.json({
      source: url,
      tirage: numeros
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
