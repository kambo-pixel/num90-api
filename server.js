import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

let journal = [];

/* =========================================
   🔥 NORMALISER TEXTE (minuscule + sans accents)
========================================= */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* =========================================
   🔥 TABLE DE CORRESPONDANCE NOM → HEURE
========================================= */
const HEURES_MAP = {
  // matin
  "reveil": "10h",
  "la matinale": "10h",
  "premiere heure": "10h",
  "kado": "10h",
  "cash": "10h",
  "soutra": "10h",
  "benediction": "10h",

  // midi
  "etoile": "13h",
  "emergence": "13h",
  "fortune": "13h",
  "privilege": "13h",
  "solution": "13h",
  "diamant": "13h",
  "prestige": "13h",

  // apres-midi
  "akwaba": "16h",
  "sika": "16h",
  "baraka": "16h",
  "monni": "16h",
  "wari": "16h",
  "moaye": "16h",
  "awale": "16h",

  // soir
  "afterwork": "19h",
  "espoir": "19h",

  // special
  "day off": "20h",

  // digital
  "digital reveil 7h": "7h",
  "digital reveil 8h": "8h",
  "digital 21h": "21h",
  "digital 22h": "22h",
  "digital 23h": "23h",

  // week-end
  "special weekend 1h": "1h",
  "special weekend 3h": "3h"
};

/* =========================================
   🔥 EXTRAIRE HEURE
========================================= */
function getHeure(tirage) {
  const t = normalize(tirage);

  for (let key in HEURES_MAP) {
    if (t.includes(key)) {
      return HEURES_MAP[key];
    }
  }

  return null;
}

/* =========================================
   🔥 AJOUTER HEURE AU NOM SI MANQUANT
========================================= */
function enrichirNom(tirage) {
  // si déjà une heure → ne rien faire
  if (/\d+h/.test(tirage)) return tirage;

  const heure = getHeure(tirage);

  if (!heure) return tirage;

  return tirage + " " + heure;
}

/* =========================================
   🔥 CONVERTIR HEURE POUR TRI
========================================= */
function heureToNumber(tirage) {
  const match = tirage.match(/(\d+)h/);
  return match ? parseInt(match[1]) : 99;
}

/* =========================================
   🔥 RECUPERATION API
========================================= */
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

            let nom = enrichirNom(draw.drawName);

            tirages.push({
              tirage: nom,
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

        // 🔥 TRI FINAL PAR HEURE
        tirages.sort((a, b) => heureToNumber(a.tirage) - heureToNumber(b.tirage));

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

/* =========================================
   🔁 AUTO REFRESH
========================================= */
fetchResults();
setInterval(fetchResults, 300000);

/* =========================================
   🌐 ROUTES
========================================= */
app.get("/", (req, res) => {
  res.json({ status: "API active" });
});

app.get("/resultats", (req, res) => {
  res.json(journal);
});

/* =========================================
   🚀 LANCEMENT SERVEUR
========================================= */
app.listen(PORT, () => {
  console.log("🚀 Serveur lancé sur " + PORT);
});
