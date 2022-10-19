const mongo = require("mongodb");
const ObjectId = require('mongodb').ObjectId; 
const uri = "mongodb+srv://root:root123@mycluster.sxglndb.mongodb.net/?retryWrites=true&w=majority";
const client = new mongo.MongoClient(uri);
let db = null;
client.connect(async function(err){
    if(err){
        console.log("Cannot connect", err);
        return;
    }
    db = client.db("board-system");
    console.log("Connected");
});

const express = require("express");
const path = require("path");
const app = express();

var sassMiddleware = require('node-sass-middleware');
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: false, // true = .sass and false = .scss
    sourceMap: true
}));

const session = require("express-session");
app.use(session({
    secret: "anything",
    resave: false,
    saveUninitialized: true
}));

app.use(
    "/css",
    express.static(path.join(__dirname,"node_modules/bootstrap/dist/css"))
)
app.use(
    "/js",
    express.static(path.join(__dirname,"node_modules/bootstrap/dist/js"))
)

app.set("view engine","ejs");
app.set("views","./views");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

app.get("/", async function(req,res){
    const alert = req.query.alert;

    let pageItem = 6;
    let pageNum = req.query.pageNum;
    if(pageNum === undefined){
        pageNum = 1;
    }

    let collection = db.collection("msg");
    let pageTotel = Math.ceil(await collection.count() / pageItem);

    let result = await collection.find({}).sort({date:-1}).skip((pageNum-1)*pageItem).limit(pageItem);
    

    let data = [];
    
    await result.forEach(item => {
        
        data.push(item);
    });

    
    
    


    res.render("index.ejs", {alert:alert, data: data, pageTotel: pageTotel, pageNum: pageNum});

});

app.get("/new-msg",async function(req,res){
    res.render("new-msg.ejs");
});

app.get("/msg",async function(req,res){
    const id = req.query._id;
    
    let collection = db.collection("msg");
    let result = await collection.findOne({
        "_id": ObjectId(id)
    });


    res.render("msg.ejs",{result:result});
});

app.post("/submit-msg",async function(req,res){
    const title = req.body.title;
    const detail = req.body.detail;
    const date = new Date(); 

    const collection = db.collection("msg");

    let result = await collection.insertOne({
        title: title,
        detail: detail,
        date : date
    })
    res.redirect("/?alert=success")
});

// http://localhost:3000/
app.listen(3000, function(){
    console.log("Server Started");
});