var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    dreams  = require("./models/dreams"),
    Comment     = require("./models/comment"),
    seedDB      = require("./seeds")
    
mongoose.connect("mongodb://localhost/oneiro");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
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
          res.render("dreams/index",{dreams:alldreams});
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
   res.render("dreams/new"); 
});

// SHOW - shows more info about one dreams
app.get("/dreams/:id", function(req, res){
    //find the dreams with provided ID
    dreams.findById(req.params.id).populate("comments").exec(function(err, founddreams){
        if(err){
            console.log(err);
        } else {
            console.log(founddreams)
            //render show template with that dreams
            res.render("dreams/show", {dreams: founddreams});
        }
    });
});


// ====================
// COMMENTS ROUTES
// ====================

app.get("/dreams/:id/comments/new", function(req, res){
    // find dreams by id
    dreams.findById(req.params.id, function(err, dreams){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {dreams: dreams});
        }
    })
});

app.post("/dreams/:id/comments", function(req, res){
   //lookup dreams using ID
   dreams.findById(req.params.id, function(err, dreams){
       if(err){
           console.log(err);
           res.redirect("/dreams");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               dreams.comments.push(comment);
               dreams.save();
               res.redirect('/dreams/' + dreams._id);
           }
        });
       }
   });
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Oneiro Server Has Started!");
});