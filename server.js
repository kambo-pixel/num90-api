import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

let journal = [];

// 🔥 ORDRE PAR JOUR
const ordreParJour = {
  lundi: ["Digital Reveil 7h","Digital Reveil 8h","Reveil","Etoile","Akwaba","Afterwork","Digital 21h","Digital 22h","Digital 23h"],
  mardi: ["Digital Reveil 7h","Digital Reveil 8h","La Matinale","Emergence","Sika","Afterwork","Digital 21h","Digital 22h","Digital 23h"],
  mercredi: ["Digital Reveil 7h","Digital Reveil 8h","Premiere Heure","Fortune","Baraka","Afterwork","Digital 21h","Digital 22h","Digital 23h"],
  jeudi: ["Digital Reveil 7h","Digital Reveil 8h","Kado","Privilege","Monni","Afterwork","Digital 21h","Digital 22h","Digital 23h"],
  vendredi: ["Digital Reveil 7h","Digital Reveil 8h","Cash","Solution","Wari","Afterwork","Day Off","Digital 21h","Digital 22h","Digital 23h"],
  samedi: ["Special Weekend 1h","Special Weekend 3h","Digital Reveil 7h","Digital Reveil 8h","Soutra","Diamant","Moaye","Afterwork","Digital 21h","Digital 22h","Digital 23h"],
  dimanche: ["Special Weekend 1h","Special Weekend 3h","Digital Reveil 7h","Digital Reveil 8h","Benediction","Prestige","Awale","Espoir","Digital 21h","Digital 22h","Digital 23h"]
};

async function fetchResults() {
  try {
    console.log("⏳ Récupération API...");

    const response = await axios.get("https://lotobonheur.ci/api/results");
    const data = response.data;

    if (!data.success) {
      console.log("❌ API erreur");
      return;
    }

    let temp = [];

    data.drawsResultsWeekly.forEach(week => {
      week.drawResultsDaily.forEach(day => {

        const fullDate = day.date + "/2026";

        let tirages = [];

        const processDraws = (draws) => {
          draws.forEach(draw => {

            if (!draw.winningNumbers || !draw.machineNumbers) return;

            if (
              draw.winningNumbers.includes(".") ||
              draw.machineNumbers.includes(".")
            ) return;

            tirages.push({
              tirage: draw.drawName,
              gagnants: draw.winningNumbers.split(" - "),
              machine: draw.machineNumbers.split(" - ")
            });
          });
        };

        if (day.drawResults.standardDraws) {
          processDraws(day.drawResults.standardDraws);
        }

        if (day.drawResults.nightDraws) {
          processDraws(day.drawResults.nightDraws);
        }

        const nomJour = day.date.split(" ")[0].toLowerCase();
        const ordre = ordreParJour[nomJour] || [];

        tirages.sort((a, b) => ordre.indexOf(a.tirage) - ordre.indexOf(b.tirage));

        temp.push({
          date: fullDate,
          tirages: tirages
        });

      });
    });

    journal = temp;

    console.log("✅ OK :", journal.length, "jours");

  } catch (err) {
    console.log("❌ ERREUR :", err.message);
  }
}

// 🔁 AUTO REFRESH
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
  console.log("🚀 Serveur lancé sur " + PORT);
});
