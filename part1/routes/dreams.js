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

//CREATE - add new dreams to DB
router.post("/", function(req, res){
    // get data from form and add to dreams array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newdreams = {name: name, image: image, description: desc}
    // Create a new dream and save to DB
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
router.get("/new", function(req, res){
   res.render("dreams/new"); 
});

// SHOW - shows more info about one dream
router.get("/:id", function(req, res){
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

module.exports = router;

