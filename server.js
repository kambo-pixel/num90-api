import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

let resultats = [];

const tirages = [

"Digital réveil 7h",
"Digital réveil 8h",
"réveil 10h",
"étoile 13h",
"Akwaba 16h",
"Afterwork 19h",
"Digital 21h",
"Digital 22h",
"Digital 23h"

];

async function scraper() {

try {

const response = await axios.get(
"https://lotobonheur.ci/resultats",
{
headers:{
"User-Agent":"Mozilla/5.0"
}
}
);

const $ = cheerio.load(response.data);

let nouveaux = [];

$(".result, .tirage, .card").each((i,el)=>{

let texte = $(el).text();

let nums = texte.match(/\b\d{1,2}\b/g);

if(nums && nums.length >=10){

let gagnants = nums.slice(0,5);
let machine = nums.slice(5,10);

nouveaux.push({

tirage: tirages[i] || "Tirage",
gagnants: gagnants,
machine: machine,
date: new Date().toISOString()

});

}

});

if(nouveaux.length>0){

resultats = nouveaux;

console.log("Mise à jour :",nouveaux.length,"tirages");

}

}
catch(e){

console.log("Erreur scraping :",e.message);

}

}

scraper();

setInterval(scraper,300000);

app.get("/",(req,res)=>{

res.json({
status:"API NUM90 active"
});

});

app.get("/resultats",(req,res)=>{

res.json(resultats);

});

app.listen(PORT,()=>{

console.log("Serveur lancé sur",PORT);

});
