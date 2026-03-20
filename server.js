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

const horaires = {

  // 🔥 COMMUN
  "Digital Reveil 7h": "7h",
  "Digital Reveil 8h": "8h",

  // LUNDI
  "Reveil": "10h",
  "Etoile": "13h",
  "Akwaba": "16h",
  "Afterwork": "19h",

  // MARDI
  "Le matinal": "10h",
  "Emergence": "13h",
  "Sika": "16h",

  // MERCREDI
  "Premiere Heure": "10h",
  "Fortune": "13h",
  "Baraka": "16h",

  // JEUDI
  "Kado": "10h",
  "Privilege": "13h",
  "Monni": "16h",

  // VENDREDI
  "Cash": "10h",
  "Solution": "13h",
  "Wari": "16h",
  "Day off": "20h",

  // SAMEDI
  "Special Weekend 1h": "1h",
  "Special Weekend 3h": "3h",
  "Soutra": "10h",
  "Diamant": "13h",
  "Moaye": "16h",

  // DIMANCHE
  "Benediction": "10h",
  "Prestige": "13h",
  "Awale": "16h",
  "Espoir": "19h",

  // DIGITAL SOIR
  "Digital 21h": "21h",
  "Digital 22h": "22h",
  "Digital 23h": "23h"

};


// 🔥 EXTRAIRE HEURE INTELLIGEMMENT
function getHeure(tirage) {
  const t = normalize(tirage);

  const map = {
    // week-end
    "special weekend 1h": 1,
    "special weekend 3h": 3,

    // matin
    "digital reveil 7h": 7,
    "digital reveil 8h": 8,

    // 10h
    "reveil": 10,
    "matinale": 10,
    "premiere heure": 10,
    "kado": 10,
    "cash": 10,
    "soutra": 10,
    "benediction": 10,

    // 13h
    "etoile": 13,
    "emergence": 13,
    "fortune": 13,
    "privilege": 13,
    "solution": 13,
    "diamant": 13,
    "prestige": 13,

    // 16h
    "akwaba": 16,
    "sika": 16,
    "baraka": 16,
    "monni": 16,
    "wari": 16,
    "moaye": 16,
    "awale": 16,

    // 19h
    "afterwork": 19,
    "espoir": 19,

    // 20h
    "day off": 20,

    // nuit
    "digital 21h": 21,
    "digital 22h": 22,
    "digital 23h": 23
  };

  for (let key in map) {
    if (t.includes(key)) {
      return map[key];
    }
  }

  return 99;
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
