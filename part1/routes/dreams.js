var express = require("express");
var router  = express.Router();
var dreams = require("../models/dreams");

//INDEX - show all dreams
router.get("/", function(req, res){
    // Get all dreams from DB
    dreams.find({}, function(err, alldreams){
       if(err){
           console.log(err);
       } else {
          res.render("dreams/index",{dreams:alldreams});
       }
    });
});

//CREATE - add new dream to DB
router.post("/", isLoggedIn, function(req, res){
    // get data from form and add to dreams array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newdreams = {name: name, image: image, description: desc, author:author}
    // Create a new dream and save to DB
    dreams.create(newdreams, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to dreams page
            console.log(newlyCreated);
            res.redirect("/dreams");
        }
    });
});

//NEW - show form to create new dream
router.get("/new", isLoggedIn, function(req, res){
   res.render("dreams/new"); 
});

// SHOW - shows more info about one dream
router.get("/:id", function(req, res){
    //find the dream with provided ID
    dreams.findById(req.params.id).populate("comments").exec(function(err, founddreams){
        if(err){
            console.log(err);
        } else {
            console.log(founddreams)
            //render show template with that dream
            res.render("dreams/show", {dreams: founddreams});
        }
    });
});


//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;

