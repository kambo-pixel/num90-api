import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

let journal = [];

// 🔥 URL API (à ajuster si besoin)
const API_URL = "https://lotobonheur.ci/api/results";

async function fetchResults() {
  try {

    const res = await axios.get(API_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const data = res.data;

    if (!data) return;

    // 🔥 FORMATAGE PROPRE
    const formatted = data.map(item => ({
      tirage: item.name || item.tirage,
      heure: item.time || item.heure,
      gagnants: item.winners || item.gagnants,
      machine: item.machine || item.machine_numbers,
      date: item.date || new Date().toISOString()
    }));

    journal = formatted;

    console.log("✅ API OK :", journal.length);

  } catch (e) {
    console.log("❌ API erreur :", e.message);
  }
}

// 🔁 toutes les 5 minutes
fetchResults();
setInterval(fetchResults, 300000);

// ROUTES
app.get("/", (req, res) => {
  res.json({ status: "API NUM90 active" });
});

app.get("/resultats", (req, res) => {
  res.json(journal);
});

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé");
});
