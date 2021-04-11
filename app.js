//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", { useUnifiedTopology: true, useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    secretword: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["secretword"]}) // encryptedFields ensures that only the secretword is encrypted, rather than the whole database

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

// /login route
app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    const username = req.body.username;
    const secretword = req.body.secretword;

    User.findOne({email: username}, function(err, foundUser){
        if (err){
            console.log(err);
        } else {
            if (foundUser) {
                if(foundUser.secretword === secretword) {
                    res.render("secrets");
                }
            }
        }      
    })
})

// /register route
app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    
    const newUser = new User({
        email: req.body.username,
        secretword: req.body.secretword,
    });

    newUser.save(function(err){
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
});

app.listen(3000, function(){
    console.log("server started on port 3000.");
})