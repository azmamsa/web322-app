var express = require("express");

var app = express();


var parse = require("body-parser")

var HTTP_PORT = process.env.PORT || 8080;

var path = require("path");

var dataService = require(path.join(__dirname, "./blog-service.js"));



function onHttpStart() {
    console.log("Http server listening on: " + HTTP_PORT);
}


//setting default to public 
app.use(express.static('public'));

app.use(parse.urlencoded({extended:true}));


app.get("/", function(req, res) {
   res.sendFile(path.join(__dirname, "/views/about.html"));
});


//the link to about page
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});



app.get("/posts", (req, res) => {

    if (req.query.category) {
        dataService.getPostsByCategory(req.query.category).then((data)=>{
            res.json(data)
        }).catch((err)=>{
            res.json({message: err});
        })
    }

    
  
    else
    {
        dataService.getAllPosts().then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    }
    
});


app.get("/blog", function(req, res){
    dataService.getPublishedPosts() 
    .then( function(data){{res.json(data);}})
    .catch( function(msg){{res.json({message: msg});}})
});


app.get("/categories", (req, res) => {
    dataService.getCategories().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});



 // the page not found send message with the status 404 and message
 

 app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/404.html"));
  });



 dataService.initialize()
 .then(() => {app.listen(HTTP_PORT, onHttpStart);})
 .catch(() => {console.log("error!")});

