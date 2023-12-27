//require ('dotenv').config();
import 'dotenv/config' //or using ES6?
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
//import CryptoJS from "crypto-js"
import md5 from "md5";



console.log(process.env.API_KEY);


const db = new pg.Client({ 
    user: "postgres",
    host: "localhost",
    database: "userDB",
    password: "sen123",
    port: 5432,
  });
  db.connect();
 
const app = express(); 
const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));


app.get("/",(req,res)=>{ 
    res.render("home.ejs");
})
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})
app.get("/register",(req,res)=>{
    res.render("register.ejs");
})


app.post("/register",async (req,res)=>{
    const email = req.body.username;
    const regPassword = md5(req.body.password);
   
    try{
        await db.query("INSERT INTO users (email, password) VALUES ($1,$2)",[email,regPassword]);
        res.render("secrets.ejs");
    }catch (err) {
        console.error("Unable to insert records: ", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/login",async (req,res)=>{
    const inputEmail = req.body.username;
    const inputPassword = md5(req.body.password);

    try{
        const result = await db.query("SELECT * FROM users WHERE email = ($1)",[inputEmail]);
        if (result.rows.length ===0){
            //UserNotFound
            res.redirect("/");
            return;
        }
        const storeredHashedtext = result.rows[0].password;
         const passwordsMatch = (inputPassword === storeredHashedtext);
         console.log(inputPassword, storeredHashedtext);
         if(passwordsMatch){
            res.render("secrets.ejs");
         }else{
            // Passwords do not match, redirect to the login page
            res.redirect("/");
         }
        }
         catch (error) {
            console.error("Error during login:", error);
            res.status(500).send("Internal Server Error");
        }
})



app.listen(port,()=>{
    console.log("Server is running on port "+port);
});

