import express from "express";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/resultats", async (req,res)=>{

  try{

    const url="https://api.allorigins.win/raw?url=https://lotobonheur.ci/resultats";

    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    const texte = $("body").text();

    const numeros = texte.match(/\b\d{1,2}\b/g);

    res.json({
      total:numeros.length,
      tirage:numeros
    });

  }catch(e){

    res.json({
      erreur:"Impossible de récupérer les résultats"
    });

  }

});

app.listen(PORT,()=>{
 console.log("Serveur lancé");
});
