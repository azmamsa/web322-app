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


//NEWCODE-------------------------------------
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const upload = multer();

cloudinary.config({ 
    cloud_name: 'dyewbnnfl', 
    api_key: '289517188466813', 
    api_secret: 'dm-D4Jiiy_g2vVHzMiDKE7cz7A0' 
});
//NEWCODE-------------------------------------



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

app.get("/blog", (req, res) => {
    blogService.getPublishedPosts()
    .then((data) => res.send(data))
    .catch((err) => res.send({message: err}))
});

app.get("/categories", (req, res) => {
    blogService.getCategories()
    .then((data) => res.send(data))
    .catch((err) => res.send({message: err}))
});

//app.get('/posts', (req, res) => {
//    blogService.getAllPosts()
//    .then((data) => res.send(data))
//    .catch((err) => res.send({message: err}))
//});

//NEWCODE-------------------------------------------------------
app.get("/posts", (req, res) => {

    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category)
        .then((data) => res.json(data))
        .catch((err) => res.json({message: err}))
    }

    
   else if(req.query.minDate != null)
   {
        blogService.getPostByMinDate(req.query.minDate)     
        .then((data) => res.json(data))
        .catch((err) => res.json({message: err}))
   }
   else
   {
        blogService.getAllPosts()
        .then((data) => res.send(data))
        .catch((err) => res.send({message: err}))
    }
});

app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/addPost.html"));
});


app.use("/posts/value", (req, res,next) => {
    
    blogService.getPostById(req.params.id)
    .then((data) => {res.send(data)})
    .catch((err) => {res.send({message: err})})

})

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                    resolve(result);
                } else {
            reject(error);
        }
        }
        );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
       };
       
       async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
       }
       
       upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
    
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        dataService.addPost(req.body).then(() => {
            res.redirect('/posts')
        }).catch(()=>{
            console.log('No results returned');
        })

    });
    
});
//NEWCODE---------------------------------------------------------------



app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/404.html"));
});

blogService.initialize()
 .then(() => {app.listen(HTTP_PORT, onHttpStart);})
 .catch(() => {console.log("error!")
});
