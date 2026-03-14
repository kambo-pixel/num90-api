import express from "express"
import axios from "axios"
import cheerio from "cheerio"

const app = express()

const URL = "https://lotobonheur.ci/resultats"

app.get("/resultats", async (req,res)=>{

try{

const response = await axios.get(URL)

const $ = cheerio.load(response.data)

let numbers=[]

$("li").each((i,e)=>{

let n=parseInt($(e).text())

if(!isNaN(n) && n>=1 && n<=90){
numbers.push(n)
}

})

let tirages=[]

for(let i=0;i<numbers.length;i+=10){

let bloc=numbers.slice(i,i+10)

if(bloc.length===10){

tirages.push({
U:bloc.slice(0,5),
M:bloc.slice(5,10)
})

}

}

res.json({
source:"Loto Bonheur",
tirages:tirages
})

}catch(err){

res.json({error:"Impossible de récupérer les résultats"})

}

})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("API NUM90 active")
})
