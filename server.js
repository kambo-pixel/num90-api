import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

let journal = [];

async function scraper() {
  try {

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://lotobonheur.ci", {
      waitUntil: "domcontentloaded",
      timeout: 0
    });

    // 🔥 ON ATTEND QUE LES DONNÉES APPARAISSENT
    await page.waitForSelector("body", { timeout: 10000 });

    // 🔥 ATTENTE SUPPLÉMENTAIRE (TRÈS IMPORTANT)
    await new Promise(r => setTimeout(r, 5000));

    const content = await page.evaluate(() => document.body.innerText);

    await browser.close();

    if (!content) {
      console.log("⚠️ contenu vide");
      return;
    }

    const lignes = content
      .split("\n")
      .map(l => l.trim())
      .filter(l => l);

    let data = [];
    let current = null;

    for (let i = 0; i < lignes.length; i++) {

      let ligne = lignes[i];

      // 🎯 NOM TIRAGE
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

        if (
          current.gagnants.length === 5 &&
          current.machine.length === 5
        ) {
          data.push(current);
        }
      }
    }

    if (data.length > 0) {
      journal = data;
      console.log("✅ OK :", journal.length);
    } else {
      console.log("❌ Toujours vide");
    }

  } catch (e) {
    console.log("❌ ERREUR :", e.message);
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
