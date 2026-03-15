import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req,res)=>{
  res.send("NUM90 API fonctionne");
});

app.get("/resultats", async (req,res)=>{

  try{

    const url = "https://corsproxy.io/?https://lotobonheur.ci/resultats";

    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    const texte = $("body").text();

    const numeros = texte.match(/\b\d{1,2}\b/g);

    res.json({
      total:numeros ? numeros.length : 0,
      tirage:numeros || []
    });

  }catch(error){

    res.json({
      erreur:"Impossible de récupérer les résultats",
      message:error.message
    });

  }

});

app.listen(PORT,()=>{
 console.log("Serveur lancé sur "+PORT);
});
