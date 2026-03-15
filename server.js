import express from "express";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req,res)=>{
  res.send("NUM90 API fonctionne");
});

app.get("/resultats", async (req,res)=>{

  try {

    const url="https://lotobonheur.ci/resultats";

    const response = await axios.get(url,{
      headers:{
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept":"text/html,application/xhtml+xml",
        "Accept-Language":"fr-FR,fr;q=0.9",
        "Connection":"keep-alive"
      },
      timeout:15000
    });

    const $ = cheerio.load(response.data);
    const texte = $("body").text();

    const numeros = texte.match(/\b\d{1,2}\b/g);

    res.json({
      source:"lotobonheur.ci",
      total:numeros.length,
      tirage:numeros
    });

  } catch(err){

    res.json({
      erreur:"Impossible de récupérer les résultats",
      details:err.message
    });

  }

});

app.listen(PORT,()=>{
  console.log("Serveur lancé");
});
