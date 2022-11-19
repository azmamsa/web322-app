const Sequelize = require('sequelize');
var sequelize = new Sequelize('Tester', 'lbivpxjx', 'Fscsqsc7JAmrDd_sg0l3Oqm6CNPCjLu1', {
    host: 'heffalump.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Posts = sequelize.define('Posts', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN

})

var Category = sequelize.define('Category', {
    caregory: Sequelize.STRING
})

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(() => {
            resolve("database has been synced");
        })
        .catch(() => {
            reject("unable to sync the database");
        })
    });
}

module.exports.getAllPosts = function(){
    return new Promise((resolve, reject) => {
        Posts.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
});

}

module.exports.getPostsByCategory = function(category){
    return new Promise((resolve, reject) => {
        Posts.findAll({
            where: {
                category: category
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned")
            })
    });

}

module.exports.getPostsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op; 
        Posts.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
            .then((data) => {
                resolve(data[0]);
            })
            .catch(() => {
                reject("no results returned")
            })
});

}

module.exports.getPostById = function(id){
    return new Promise((resolve, reject) => {

        Posts.findAll({
            where: {
                postID: id
            }
        })
            .then((data) => {
                resolve(data[0]);
            })
            .catch(() => {
                reject("no results returned")
            })
    });

}

module.exports.addPost = function(postData){
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (var i in postData) {
            if (postData[i] == "") {
                postData[i] = null;
            }
        }
        resolve(Posts.create({}))
        
        .then(() => {
            resolve();
        })
        .catch(() => {
            reject("unable to create post")
        })
});

}

module.exports.getPublishedPosts = function(){
    return new Promise((resolve, reject) => {
        Posts.findAll({
            where: {
                published: true
            }
        })
            .then((data) => {
                resolve(data[0]);
            })
            .catch(() => {
                reject("no results returned")
            })
});
}


module.exports.getPublishedPostsByCategory = function(){
    return new Promise((resolve, reject) => {
        Posts.findAll({
        where: {
            published: true,
            category: Category
        }
    })
        .then((data) => {
            resolve(data[0]);
        })
        .catch(() => {
            reject("no results returned")
        })
});
}

module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
});

}