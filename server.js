import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

let journal = [];

// 🔥 NORMALISER TEXTE (enlever accents + minuscule)
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// 🔥 EXTRAIRE HEURE INTELLIGEMMENT
function getHeure(tirage) {
  const t = normalize(tirage);

  if (t.includes("1h")) return 1;
  if (t.includes("3h")) return 3;
  if (t.includes("7h")) return 7;
  if (t.includes("8h")) return 8;

  if (t.includes("10") || t.includes("matinal") || t.includes("premiere") || t.includes("kado") || t.includes("cash") || t.includes("soutra") || t.includes("benediction"))
    return 10;

  if (t.includes("13") || t.includes("etoile") || t.includes("emergence") || t.includes("fortune") || t.includes("privilege") || t.includes("solution") || t.includes("diamant") || t.includes("prestige"))
    return 13;

  if (t.includes("16") || t.includes("akwaba") || t.includes("sika") || t.includes("baraka") || t.includes("monni") || t.includes("wari") || t.includes("moaye") || t.includes("awale"))
    return 16;

  if (t.includes("19") || t.includes("afterwork") || t.includes("espoir"))
    return 19;

  if (t.includes("20") || t.includes("day off"))
    return 20;

  if (t.includes("21")) return 21;
  if (t.includes("22")) return 22;
  if (t.includes("23")) return 23;

  return 99; // fallback sécurité
}

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

        // 🔥 TRI ULTRA FIABLE PAR HEURE
        tirages.sort((a, b) => getHeure(a.tirage) - getHeure(b.tirage));

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
