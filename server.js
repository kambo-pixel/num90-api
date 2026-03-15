import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("NUM90 API fonctionne");
});

app.get("/resultats", (req, res) => {
  res.json({
    tirage: [12, 25, 33, 48, 67]
  });
});

app.listen(PORT, () => {
  console.log("Serveur lancé sur le port " + PORT);
});
