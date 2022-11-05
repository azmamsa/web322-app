/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy. I've referred to Stackoverflow for creating code for some of my .hbs files 
*  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
* 
*  Name: Abid Zuberbhai Mamsa Student ID: 158290205 Date: 04/11/22
*
*  Online (Cyclic) Link: https://drab-jade-brown-bear-suit.cyclic.app/
*
********************************************************************************/ 
var express = require("express");
var app = express();
var parse = require("body-parser");
var HTTP_PORT = process.env.PORT || 8080;
var path = require("path");
var blogData = require(path.join(__dirname, "./blog-service.js"));
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const upload = multer();


//NEWCODE---begin----------------------------------
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");

app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },

        safeHTML: function(context){
            return stripJs(context);
        }
        
        
    }
}));

app.set('view engine', '.hbs');

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

//NEWCODE---end----------------------------------



cloudinary.config({ 
    cloud_name: 'dyewbnnfl', 
    api_key: '289517188466813', 
    api_secret: 'dm-D4Jiiy_g2vVHzMiDKE7cz7A0' 
});

function onHttpStart() {
    console.log("Http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"));
app.use(parse.urlencoded({extended:true}));

//code update--------------------------------------------------------
app.get("/", (req, res) => {
  //res.sendFile(path.join(__dirname,"./views/about.html"));
  res.render("about");
});

//code update--------------------------------------------------------
app.get("/about", (req, res) => {
    //res.sendFile(path.join(__dirname,"./views/about.html"));
    res.render("about");
});

//code update-------------------------------------------------------
app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});


app.get("/categories", (req, res) => {
    blogData.getCategories()
    .then((data) => res.render("categories", {categories: data}))
    .catch((err) => res.render("categories", {message: err}))
});

//(old version /post route)
//app.get('/posts', (req, res) => {
//    blogService.getAllPosts()
//    .then((data) => res.send(data))
//    .catch((err) => res.send({message: err}))
//});

app.get("/posts", (req, res) => {

    if (req.query.category) {
        blogData.getPostsByCategory(req.query.category)
        .then((data) => res.render("posts", {posts: data}))
        .catch((err) => res.render("posts", {message: err}))
    }

    
   else if(req.query.minDate != null)
   {
        blogData.getPostByMinDate(req.query.minDate)     
        .then((data) => res.render("posts", {posts: data}))
        .catch((err) => res.render("posts", {message: err}))
   }
   else
   {
        blogData.getAllPosts()
        .then((data) => res.render("posts", {posts: data}))
        .catch((err) => res.render("posts", {message: err}))
    }
    
});

//code update--------------------------------------------------------
app.get("/posts/add", (req, res) => {
    //res.sendFile(path.join(__dirname, "./views/addPost.html"));
    res.render("addPost");
});

//code update--------------------------------------------------------

app.use("/posts/value", (req, res,next) => {
    
    blogData.getPostById(req.params.id)
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
    });
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



app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"ERROR:SERVER NOT FOUND!"));
});

blogData.initialize()
 .then(() => {app.listen(HTTP_PORT, onHttpStart);})
 .catch(() => {console.log("error!")
});
