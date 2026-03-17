import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

let journal = [];

async function scraper() {
  try {

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://lotobonheur.ci", {
      waitUntil: "networkidle2",
      timeout: 0
    });

    // 🔥 On récupère tout le texte visible
    const content = await page.evaluate(() => document.body.innerText);

    await browser.close();

    const lignes = content.split("\n").map(l => l.trim()).filter(l => l);

    let data = [];
    let current = null;

    for (let i = 0; i < lignes.length; i++) {

      let ligne = lignes[i];

      // 🎯 détecter nom du tirage
      if (
        ligne.length < 40 &&
        !ligne.includes("Gagnants") &&
        !ligne.includes("Machine") &&
        isNaN(ligne)
      ) {
        current = {
          tirage: ligne,
          gagnants: [],
          machine: []
        };
      }

      // 🎯 GAGNANTS
      if (ligne === "Gagnants") {
        current.gagnants = lignes.slice(i + 1, i + 6);
      }

      // 🎯 MACHINE
      if (ligne === "Machine") {
        current.machine = lignes.slice(i + 1, i + 6);

        if (current.gagnants.length === 5 && current.machine.length === 5) {
          data.push(current);
        }
      }
    }

    if (data.length > 0) {
      journal = data;
      console.log("✅ Tirages :", journal.length);
    } else {
      console.log("⚠️ Aucun tirage trouvé");
    }

  } catch (e) {
    console.log("❌ Erreur :", e.message);
  }
}

// 🔁 toutes les 5 min
scraper();
setInterval(scraper, 300000);

app.get("/", (req, res) => {
  res.json({ status: "API active" });
});

app.get("/resultats", (req, res) => {
  res.json(journal);
});

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé");
});
