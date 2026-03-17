import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 COLLE ICI TON JSON (IMPORTANT)
let sourceData = {
  "source": "lotobonheur",
  "total": 1574,
  "tirage": [/* colle ton tableau ici */]
};

// 🔁 fonction de transformation
function organiser() {
  let resultats = [];

  for (let i = 0; i < sourceData.tirage.length; i += 10) {

    let gagnants = sourceData.tirage.slice(i, i + 5);
    let machine = sourceData.tirage.slice(i + 5, i + 10);

    if (gagnants.length === 5 && machine.length === 5) {
      resultats.push({
        tirage: `Tirage ${i / 10 + 1}`,
        gagnants,
        machine
      });
    }
  }

  return resultats;
}

// ROUTES
app.get("/", (req, res) => {
  res.json({ status: "API OK" });
});

app.get("/resultats", (req, res) => {
  res.json(organiser());
});

app.listen(PORT, () => {
  console.log("🚀 Serveur lancé");
});
