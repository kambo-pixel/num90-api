import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

let journal = [];

const tiragesAutorises = [

"Digital réveil 7h",
"Digital réveil 8h",
"Réveil 10h",
"Etoile 13h",
"Akwaba 16h",
"Afterwork 19h",
"Digital 21h",
"Digital 22h",
"Digital 23h",

"Le matinal 10h",
"Emergence 13h",
"Sika 16h",

"Première heure 10h",
"Fortune 13h",
"Baraka 16h",

"Kado 10h",
"Privilège 13h",
"Monni 16h",

"Cash 10h",
"Solution 13h",
"Wari 16h",
"Day off 20h",

"Spécial week-end 1h",
"Spécial week-end 3h",

"Soutra 10h",
"Diamant 13h",
"Moaye 16h",

"Bénédiction 10h",
"Prestige 13h",
"Awale 16h",
"Espoir 19h"

];

async function recupererResultats(){

try{

const response = await axios.get(
"https://lotobonheur.ci/resultats",
{
headers:{
"User-Agent":"Mozilla/5.0",
"Accept":"text/html"
}
}
);

const $ = cheerio.load(response.data);

let nouveauxResultats = [];

$("div").each((i,el)=>{

const texte = $(el).text().trim();

tiragesAutorises.forEach(nom =>{

if(texte.includes(nom)){

const nombres = texte.match(/\b\d{1,2}\b/g);

if(nombres && nombres.length >= 10){

const gagnants = nombres.slice(0,5);
const machine = nombres.slice(5,10);

nouveauxResultats.push({

tirage: nom,
gagnants: gagnants,
machine: machine,
date: new Date().toISOString()

});

}

}

});

});

if(nouveauxResultats.length > 0){

journal = nouveauxResultats;

console.log("Nouveaux résultats récupérés");

}

}catch(error){

console.log("Erreur récupération :",error.message);

}

}

setInterval(recupererResultats,300000);

app.get("/",(req,res)=>{

res.json({
status:"API NUM90 active"
});

});

app.get("/resultats",(req,res)=>{

res.json(journal);

});

app.get("/dernier",(req,res)=>{

if(journal.length > 0){

res.json(journal[0]);

}else{

res.json({message:"Aucun tirage"});

}

});

app.listen(PORT,()=>{

console.log("Serveur lancé sur le port "+PORT);

});
