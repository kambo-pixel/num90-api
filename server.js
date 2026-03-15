import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("NUM90 API fonctionne");
});

app.get("/resultats", async (req, res) => {

  try {

    const browser = await puppeteer.launch({
      args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://lotobonheur.ci/resultats", {
      waitUntil: "networkidle2"
    });

    const numeros = await page.evaluate(() => {

      const resultats = [];

      document.querySelectorAll("li").forEach(el => {
        const n = parseInt(el.innerText);
        if(!isNaN(n)) resultats.push(n);
      });

      return resultats;

    });

    await browser.close();

    res.json({
      source: "lotobonheur.ci",
      tirage: numeros
    });

  } catch (error) {

    res.json({
      erreur: "Scraper impossible",
      details: error.message
    });

  }

});

app.listen(PORT, () => {
  console.log("Serveur lancé");
});
