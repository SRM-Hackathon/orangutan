var express = require("express");
var router  = express.Router();
var dreams = require("../models/dreams");
var middleware = require("../middleware");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'oneiro', 
  api_key:'773461182445614', 
  api_secret:'EJplyu8nVO_SPPNS5u7IvNKdOAA' 
});

//INDEX - show all dreams
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all dreams from DB
        dreams.find({name: regex}, function(err, alldreams){
           if(err){
               console.log(err);
           } else {
              if(alldreams.length < 1) {
                  noMatch = "No dreams match that query, please try again.";
              }
              res.render("dreams/index",{dreams:alldreams, noMatch: noMatch});
           }
        });
    } else {
        // Get all dreams from DB
        dreams.find({}, function(err, alldreams){
           if(err){
               console.log(err);
           } else {
              res.render("dreams/index",{dreams:alldreams, noMatch: noMatch});
           }
        });
    }
});

//CREATE - add new dream to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the dreams object under image property
      req.body.dreams.image = result.secure_url;
      // add image's public_id to dreams object
      req.body.dreams.imageId = result.public_id;
      // add author to dreams
      req.body.dreams.author = {
        id: req.user._id,
        username: req.user.username
      }
      dreams.create(req.body.dreams, function(err, dreams) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/dreams/' + dreams.id);
      });
    });
});


//NEW - show form to create new dreams
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
            //render show template with that dreams
            res.render("dreams/show", {dreams: founddreams});
        }
    });
});

// EDIT dreams ROUTE
router.get("/:id/edit", middleware.checkdreamsOwnership, function(req, res){
    dreams.findById(req.params.id, function(err, founddreams){
        res.render("dreams/edit", {dreams:founddreams});
    });
});
// update

router.put("/:id", upload.single('image'), function(req, res){
    dreams.findById(req.params.id, async function(err, dreams){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(dreams.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  dreams.imageId = result.public_id;
                  dreams.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            dreams.name = req.body.name;
            dreams.description = req.body.description;
            dreams.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/dreams/" + dreams._id);
        }
    });
});
// DESTROY dreams ROUTE
router.delete('/:id', function(req, res) {
  dreams.findById(req.params.id, async function(err, dreams) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(dreams.imageId);
        dreams.remove();
        req.flash('success', 'dreams deleted successfully!');
        res.redirect('/dreams');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;

