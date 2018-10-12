var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    dreams      = require("./models/dreams"),
    seedDB      = require("./seeds")
    
mongoose.connect("mongodb://localhost/oneiro");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
seedDB();

app.get("/", function(req, res){
    res.render("landing");
});

//INDEX - show all dreams
app.get("/dreams", function(req, res){
    // Get all dreams from DB
    dreams.find({}, function(err, alldreams){
       if(err){
           console.log(err);
       } else {
          res.render("index",{dreams:alldreams});
       }
    });
});

//CREATE - add new dreams to DB
app.post("/dreams", function(req, res){
    // get data from form and add to dreams array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newdreams = {name: name, image: image, description: desc}
    // Create a new dreams and save to DB
    dreams.create(newdreams, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to dreams page
            res.redirect("/dreams");
        }
    });
});

//NEW - show form to create new dreams
app.get("/dreams/new", function(req, res){
   res.render("new.ejs"); 
});

// SHOW - shows more info about one dream
app.get("/dreams/:id", function(req, res){
    //find the dream with provided ID
    dreams.findById(req.params.id).populate("comments").exec(function(err, founddreams){
        if(err){
            console.log(err);
        } else {
            console.log(founddreams)
            //render show template with that dreams
            res.render("show", {dreams: dreams});
        }
    });
})

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Oneiro Server Has Started!");
});