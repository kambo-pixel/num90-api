import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 TON API (celle que tu as trouvée)
const API_URL = "https://api.onrender.com/lotobonheur"; // ← remplace par ton vrai lien

let journal = [];

// 🔥 fonction principale
async function fetchResults() {
  try {

    const response = await axios.get(API_URL);
    const data = response.data;

    if (!data.success) {
      console.log("❌ API pas valide");
      return;
    }

    let results = [];

    data.drawsResultsWeekly.forEach(week => {

      week.drawResultsDaily.forEach(day => {

        const date = day.date;

        // 🔥 fusion night + standard
        const allDraws = [
          ...day.drawResults.nightDraws,
          ...day.drawResults.standardDraws
        ];

        allDraws.forEach(draw => {

          // ❌ ignorer les vides
          if (draw.drawName === "-" || draw.winningNumbers.includes(".")) return;

          results.push({
            date: date,
            tirage: draw.drawName,
            gagnants: draw.winningNumbers.split(" - "),
            machine: draw.machineNumbers.split(" - ")
          });

        });

      });

    });

    // 🔥 tri chronologique (du plus récent au plus ancien)
    results.reverse();

    journal = results;

    console.log("✅ Résultats chargés :", journal.length);

  } catch (error) {
    console.log("❌ Erreur API :", error.message);
  }
}

// 🔁 mise à jour toutes les 5 min
fetchResults();
setInterval(fetchResults, 300000);

// ROUTES
app.get("/", (req, res) => {
  res.json({ status: "OK API NUM90" });
});

app.get("/resultats", (req, res) => {
  res.json(journal);
});

app.listen(PORT, () => {
  console.log("🚀 Serveur démarré sur port", PORT);
});
