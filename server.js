import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

let journal = [];

// 🔥 API interne (à adapter si besoin)
const URL = "https://lotobonheur.ci/api/draws"; // ⚠️ à ajuster si ton URL exacte est différente

function formatData(data) {
  let result = [];

  data.drawsResultsWeekly.forEach(week => {
    week.drawResultsDaily.forEach(day => {

      const date = day.date;

      const allDraws = [
        ...day.drawResults.nightDraws,
        ...day.drawResults.standardDraws
      ];

      allDraws.forEach(draw => {

        if (
          draw.drawName !== "-" &&
          !draw.winningNumbers.includes(".")
        ) {
          result.push({
            date,
            tirage: draw.drawName,
            gagnants: draw.winningNumbers.split(" - "),
            machine: draw.machineNumbers.split(" - ")
          });
        }

      });

    });
  });

  return result;
}

// 🔁 récupération automatique
async function fetchData() {
  try {

    const res = await axios.get(URL);

    if (res.data && res.data.success) {
      journal = formatData(res.data);
      console.log("✅ Données récupérées :", journal.length);
    } else {
      console.log("❌ Mauvaise réponse API");
    }

  } catch (err) {
    console.log("❌ Erreur API :", err.message);
  }
}

// 🔁 toutes les 5 minutes
fetchData();
setInterval(fetchData, 300000);

// 🌐 routes
app.get("/", (req, res) => {
  res.json({ status: "API active" });
});

app.get("/resultats", (req, res) => {
  res.json(journal);
});

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé");
});
