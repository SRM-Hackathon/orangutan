var express = require("express");
var router  = express.Router();
var dreams = require("../models/dreams");
var middleware = require("../middleware");


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
router.post("/", middleware.isLoggedIn, function(req, res){
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
router.get("/new", middleware.isLoggedIn, function(req, res){
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

// EDIT Dream ROUTE
router.get("/:id/edit", middleware.checkDreamsOwnership, function(req, res){
    dreams.findById(req.params.id, function(err, founddreams){
        res.render("dreams/edit", {dreams: founddreams});
    });
});

// UPDATE Dream ROUTE
router.put("/:id",middleware.checkDreamsOwnership, function(req, res){
    // find and update the correct dream
    dreams.findByIdAndUpdate(req.params.id, req.body.dreams, function(err, updateddreams){
       if(err){
           res.redirect("/dreams");
       } else {
           //redirect somewhere(show page)
           res.redirect("/dreams/" + req.params.id);
       }
    });
});

// DESTROY Dream ROUTE
router.delete("/:id",middleware.checkDreamsOwnership, function(req, res){
   dreams.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/dreams");
      } else {
          res.redirect("/dreams");
      }
   });
});


module.exports = router;

