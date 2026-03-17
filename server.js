import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

// 🔥 TA DATA (remplace plus tard par API réelle si besoin)
let sourceData = {}; // tu peux coller ici ton JSON

let journal = [];

// 🎯 ORDRE DES JOURS
const joursOrdre = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche"
];

// 🎯 ORDRE DES HEURES
const ordreTirages = [
  "Special Weekend 1h",
  "Special Weekend 3h",
  "Digital Reveil 7h",
  "Digital Reveil 8h",
  "Reveil",
  "La Matinale",
  "Premiere Heure",
  "Kado",
  "Cash",
  "Soutra",
  "Benediction",
  "Etoile",
  "Emergence",
  "Fortune",
  "Privilege",
  "Solution",
  "Diamant",
  "Prestige",
  "Akwaba",
  "Sika",
  "Baraka",
  "Monni",
  "Wari",
  "Moaye",
  "Awale",
  "Afterwork",
  "Espoir",
  "Day Off",
  "Digital 21h",
  "Digital 22h",
  "Digital 23h"
];

function cleanData(data) {

  let results = [];

  data.drawsResultsWeekly.forEach(week => {
    week.drawResultsDaily.forEach(day => {

      const dayName = day.date.split(" ")[0];

      const draws = [
        ...day.drawResults.nightDraws,
        ...day.drawResults.standardDraws
      ];

      draws.forEach(draw => {

        if (
          draw.drawName === "-" ||
          draw.winningNumbers.includes(".")
        ) return;

        results.push({
          jour: dayName,
          date: day.date,
          tirage: draw.drawName,
          gagnants: draw.winningNumbers.split(" - "),
          machine: draw.machineNumbers.includes(".")
            ? []
            : draw.machineNumbers.split(" - ")
        });

      });

    });
  });

  // 🔥 TRI PAR JOUR + HEURE
  results.sort((a, b) => {

    const jA = joursOrdre.indexOf(a.jour.toLowerCase());
    const jB = joursOrdre.indexOf(b.jour.toLowerCase());

    if (jA !== jB) return jA - jB;

    const tA = ordreTirages.indexOf(a.tirage);
    const tB = ordreTirages.indexOf(b.tirage);

    return tA - tB;
  });

  return results;
}

// 🔁 Simulation update toutes les 5 min
function update() {
  try {
    if (!sourceData.success) return;

    journal = cleanData(sourceData);

    console.log("✅ Résultats chargés :", journal.length);

  } catch (e) {
    console.log("❌ ERREUR :", e.message);
  }
}

setInterval(update, 300000);
update();

// ROUTES
app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

app.get("/resultats", (req, res) => {
  res.json(journal);
});

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé sur", PORT);
});
