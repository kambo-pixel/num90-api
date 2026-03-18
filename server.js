import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

let journal = [];

async function fetchResults() {
  try {
    console.log("⏳ Récupération API...");

    const response = await axios.get(
      "https://lotobonheur.ci/api/results"
    );

    const data = response.data;

    if (!data.success) {
      console.log("❌ API erreur");
      return;
    }

    let results = [];

    data.drawsResultsWeekly.forEach(week => {
      week.drawResultsDaily.forEach(day => {

        const date = day.date;

        const processDraws = (draws) => {
          draws.forEach(draw => {

            if (!draw.winningNumbers || !draw.machineNumbers) return;

if (
  draw.winningNumbers.includes(".") ||
  draw.machineNumbers.includes(".")
) return;
            results.push({
              date: date,
              tirage: draw.drawName,
              gagnants: draw.winningNumbers.split(" - "),
              machine: draw.machineNumbers.split(" - ")
            });
          });
        };

        if (day.drawResults.nightDraws) {
          processDraws(day.drawResults.nightDraws);
        }

        if (day.drawResults.standardDraws) {
          processDraws(day.drawResults.standardDraws);
        }

      });
    });

    journal = results;

    console.log("✅ Résultats récupérés :", journal.length);

  } catch (err) {
    console.log("❌ ERREUR :", err.message);
  }
}

// 🔁 toutes les 5 minutes
fetchResults();
setInterval(fetchResults, 300000);

// ROUTES
app.get("/", (req, res) => {
  res.json({ status: "API active" });
});

app.get("/resultats", (req, res) => {
  res.json(journal);
});

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé");
});
