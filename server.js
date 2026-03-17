import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 TON API ICI (IMPORTANT)
const API_URL = "https://ton-api-onrender.com"; // ← mets ton vrai lien ici

let journal = [];

async function fetchResults() {
  try {

    const response = await axios.get(API_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
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

          if (
            draw.drawName === "-" ||
            !draw.winningNumbers ||
            draw.winningNumbers.includes(".")
          ) return;

          results.push({
            date,
            tirage: draw.drawName,
            gagnants: draw.winningNumbers.split(" - "),
            machine: draw.machineNumbers.split(" - ")
          });

        });

      });
    });

    journal = results.reverse();

    console.log("✅ OK :", journal.length);

  } catch (err) {
    console.log("❌ ERREUR :", err.message);
  }
}

// 🔁 refresh 5 min
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
