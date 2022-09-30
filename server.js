/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Abid Zuberbhai Mamsa Student ID: 158290205 Date: 28/08/22
*
*  Online (Cyclic) Link: https://drab-jade-brown-bear-suit.cyclic.app/
*
********************************************************************************/ 
var express = require("express");
var app = express();
var parse = require("body-parser");
var HTTP_PORT = process.env.PORT || 8080;
var path = require('path');
var blogService = require(path.join(__dirname, "./blog-service.js"));

function onHttpStart() {
    console.log("Http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"));
app.use(parse.urlencoded({extended:true}));



app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,"./views/about.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname,"./views/about.html"));
});
 
app.get('/posts', (req, res) => {
    blogService.getAllPosts()
    .then((data) => res.send(data))
    .catch((err) => res.send({message: err}))
});

app.get('/blog', (req, res) => {
    blogService.getPublishedPosts()
    .then((data) => res.send(data))
    .catch((err) => res.send({message: err}))
});

app.get('/categories', (req, res) => {
    blogService.getCategories()
    .then((data) => res.send(data))
    .catch((err) => res.send({message: err}))
});






app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/404.html"));
});



 blogService.initialize()
 .then(() => {app.listen(HTTP_PORT, onHttpStart);})
 .catch(() => {console.log("error!")
});
