import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

let journal = [];

async function recupererResultats() {

  try {

    const response = await axios.get(
      "https://lotobonheur.ci/resultats",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "text/html"
        }
      }
    );

    const $ = cheerio.load(response.data);

    const texte = $("body").text();

    const nombres = texte.match(/\b\d{1,2}\b/g);

    if(!nombres) return;

    let nouveaux = [];

    for(let i=0;i<nombres.length;i+=10){

      const bloc = nombres.slice(i,i+10);

      if(bloc.length === 10){

        nouveaux.push({

          gagnants: bloc.slice(0,5),

          machine: bloc.slice(5,10),

          date: new Date().toISOString()

        });

      }

    }

    if(nouveaux.length>0){

      journal = nouveaux;

      console.log("Résultats mis à jour :",journal.length);

    }

  } catch(e) {

    console.log("Erreur :",e.message);

  }

}

recupererResultats();

setInterval(recupererResultats,300000);

app.get("/",(req,res)=>{

  res.json({
    status:"NUM90 API active"
  });

});

app.get("/resultats",(req,res)=>{

  res.json(journal);

});

app.listen(PORT,()=>{

  console.log("Serveur lancé sur "+PORT);

});
