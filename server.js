import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

let journal = [];

async function scraper() {
  try {

    const response = await axios.get("https://lotobonheur.ci", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = response.data;

    // 🔥 Nettoyage du texte
    const text = html
      .replace(/\r/g, "")
      .replace(/\n+/g, "\n");

    const lignes = text.split("\n");

    let data = [];
    let current = null;

    for (let i = 0; i < lignes.length; i++) {

      let ligne = lignes[i].trim();

      // 🎯 Détection nom tirage
      if (
        ligne &&
        !ligne.includes("Gagnants") &&
        !ligne.includes("Machine") &&
        !ligne.includes("#####") &&
        !ligne.includes("Semaine") &&
        ligne.length < 30
      ) {
        current = {
          tirage: ligne,
          gagnants: [],
          machine: []
        };
      }

      // 🎯 GAGNANTS
      if (ligne.includes("Gagnants")) {
        current.gagnants = lignes
          .slice(i + 1, i + 6)
          .map(n => n.trim());
      }

      // 🎯 MACHINE
      if (ligne.includes("Machine")) {
        current.machine = lignes
          .slice(i + 1, i + 6)
          .map(n => n.trim());

        // 🔥 VALIDATION
        if (
          current.gagnants.length === 5 &&
          current.machine.length === 5
        ) {
          data.push(current);
        }
      }
    }

    if (data.length > 0) {
      journal = data;
      console.log("✅ Tirages récupérés :", journal.length);
    }

  } catch (e) {
    console.log("❌ Erreur :", e.message);
  }
}

// 🔁 toutes les 5 min
scraper();
setInterval(scraper, 300000);

app.get("/", (req, res) => {
  res.json({ status: "API active" });
});

app.get("/resultats", (req, res) => {
  res.json(journal);
});

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé");
});
