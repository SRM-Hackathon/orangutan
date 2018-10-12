var express = require("express");
var router  = express.Router({mergeParams: true});
var dreams = require("../models/dreams");
var Comment = require("../models/comment");

//Comments New
router.get("/new", isLoggedIn, function(req, res){
    // find dream by id
    console.log(req.params.id);
    dreams.findById(req.params.id, function(err, dreams){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {dreams: dreams});
        }
    })
});

//Comments Create
router.post("/",isLoggedIn,function(req, res){
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

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


module.exports = router;