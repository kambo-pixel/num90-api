import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

let journal = [];

async function scraper() {

try {

const response = await axios.get(
"https://lotobonheur.ci",
{
headers:{
"User-Agent":"Mozilla/5.0"
}
}
);

const html = response.data;

const nombres = html.match(/\b\d{1,2}\b/g);

if(!nombres) return;

let tirages = [];

for(let i=0;i<nombres.length;i++){

let bloc = nombres.slice(i,i+10);

if(bloc.length===10){

tirages.push({

gagnants: bloc.slice(0,5),
machine: bloc.slice(5,10)

});

}

}

if(tirages.length>0){

journal = tirages.slice(0,20);

console.log("Tirages trouvés :",journal.length);

}

}
catch(e){

console.log("Erreur :",e.message);

}

}

scraper();

setInterval(scraper,300000);

app.get("/",(req,res)=>{

res.json({
status:"API active"
});

});

app.get("/resultats",(req,res)=>{

res.json(journal);

});

app.listen(PORT,()=>{

console.log("Serveur lancé");

});
