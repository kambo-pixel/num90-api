import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

let journal = [];

async function scraper() {
  try {
    console.log("⏳ Scraping en cours...");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // 🔥 simuler vrai navigateur
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    await page.goto("https://lotobonheur.ci/resultats", {
      waitUntil: "networkidle2",
      timeout: 0
    });

    // 🔥 attendre chargement JS
    await page.waitForSelector("body");
    await new Promise(r => setTimeout(r, 8000)); // très important

    // 🔥 récupérer texte
    const text = await page.evaluate(() => document.body.innerText);

    await browser.close();

    if (!text) {
      console.log("❌ Texte vide");
      return;
    }

    const lignes = text
      .split("\n")
      .map(l => l.trim())
      .filter(l => l);

    let data = [];
    let current = null;
    let currentDate = "";

    for (let i = 0; i < lignes.length; i++) {
      let l = lignes[i];

      // 📅 date
      if (l.match(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/i)) {
        currentDate = l;
      }

      // 🎯 nom tirage
      else if (
        l.length < 40 &&
        !l.includes("Gagnants") &&
        !l.includes("Machine") &&
        isNaN(l)
      ) {
        current = {
          date: currentDate,
          tirage: l,
          gagnants: [],
          machine: []
        };
      }

      // 🎯 gagnants
      else if (l === "Gagnants") {
        current.gagnants = lignes.slice(i + 1, i + 6);
      }

      // 🎯 machine
      else if (l === "Machine") {
        current.machine = lignes.slice(i + 1, i + 6);

        if (
          current &&
          current.gagnants.length === 5 &&
          current.machine.length === 5
        ) {
          data.push(current);
        }
      }
    }

    if (data.length > 0) {
      journal = data;
      console.log("✅ Résultats :", journal.length);
    } else {
      console.log("❌ Aucun résultat trouvé");
    }

  } catch (err) {
    console.log("❌ ERREUR :", err.message);
  }
}

// 🔁 toutes les 5 minutes
scraper();
setInterval(scraper, 300000);

// ROUTES
app.get("/", (req, res) => {
  res.json({ status: "API active" });
});

app.get("/resultats", (req, res) => {
  res.json(journal);
});

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé sur port " + PORT);
});
