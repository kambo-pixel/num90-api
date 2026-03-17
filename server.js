import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 COLLE ICI TON TEXTE COMPLET
let rawText = `COLLE ICI TON TEXTE EXACT`;

// 🔁 parser
function parser() {
  const lignes = rawText
    .split("\n")
    .map(l => l.trim())
    .filter(l => l);

  let data = [];
  let currentDate = "";
  let currentTirage = null;

  for (let i = 0; i < lignes.length; i++) {

    let l = lignes[i];

    // 📅 détecter date
    if (l.match(/^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)/)) {
      currentDate = l;
    }

    // 🎯 détecter tirage
    else if (
      l.length < 40 &&
      !l.includes("Gagnants") &&
      !l.includes("Machine") &&
      isNaN(l)
    ) {
      currentTirage = {
        date: currentDate,
        tirage: l,
        gagnants: [],
        machine: []
      };
    }

    // 🎯 gagnants
    else if (l === "##### Gagnants :" || l === "Gagnants") {
      currentTirage.gagnants = lignes.slice(i + 1, i + 6).map(Number);
    }

    // 🎯 machine
    else if (l === "##### Machine :" || l === "Machine") {
      currentTirage.machine = lignes.slice(i + 1, i + 6).map(Number);

      if (currentTirage.gagnants.length === 5) {
        data.push(currentTirage);
      }
    }
  }

  return data;
}

// ROUTES
app.get("/", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/resultats", (req, res) => {
  res.json(parser());
});

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé");
});
