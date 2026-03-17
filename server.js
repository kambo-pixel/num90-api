import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ API DU SITE (IMPORTANT)
const API_URL = "https://lotobonheur.ci/api/draws/results"; // ← si ça bloque on ajuste après

let journal = [];

async function fetchResults() {
  try {

    const response = await axios.get(API_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Referer": "https://lotobonheur.ci/resultats",
        "Origin": "https://lotobonheur.ci"
      }
    });

    const data = response.data;

    if (!data.success) {
      console.log("❌ API invalide");
      return;
    }

    let results = [];

    data.drawsResultsWeekly.forEach(week => {
      week.drawResultsDaily.forEach(day => {

        const date = day.date;

        const draws = [
          ...day.drawResults.nightDraws,
          ...day.drawResults.standardDraws
        ];

        draws.forEach(draw => {

          // ❌ on ignore les faux tirages
          if (
            draw.drawName === "-" ||
            draw.winningNumbers.includes(".")
          ) return;

          results.push({
            date: date,
            tirage: draw.drawName,
            gagnants: draw.winningNumbers.split(" - "),
            machine: draw.machineNumbers.includes(".")
              ? []
              : draw.machineNumbers.split(" - ")
          });

        });

      });
    });

    // ✅ tri chronologique (du plus récent au plus ancien)
    journal = results.reverse();

    console.log("✅ Résultats :", journal.length);

  } catch (err) {
    console.log("❌ ERREUR :", err.message);
  }
}

// 🔁 toutes les 5 minutes
fetchResults();
setInterval(fetchResults, 300000);

// ROUTES
app.get("/", (req, res) => {
  res.json({ status: "API NUM90 OK" });
});

app.get("/resultats", (req, res) => {
  res.json(journal);
});

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé sur", PORT);
});
