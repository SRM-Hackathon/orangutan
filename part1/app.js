var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    dreams  = require("./models/dreams"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");
    
mongoose.connect("mongodb://localhost/oneiro");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "nothing to say!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

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

//NEW - show form to create new dream
app.get("/dreams/new", function(req, res){
   res.render("dreams/new"); 
});

// SHOW - shows more info about one dream
app.get("/dreams/:id", function(req, res){
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


// ====================
// COMMENTS ROUTES
// ====================

app.get("/dreams/:id/comments/new", isLoggedIn, function(req, res){
    // find dream by id
    dreams.findById(req.params.id, function(err, dreams){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {dreams: dreams});
        }
    })
});

app.post("/dreams/:id/comments",isLoggedIn,function(req, res){
   //lookup dream using ID
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
   //create new comment
   //connect new comment to dream
   //redirect dream show page
});


//  ===========
// AUTH ROUTES
//  ===========

// show register form
app.get("/register", function(req, res){
   res.render("register"); 
});
//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/dreams"); 
        });
    });
});

// show login form
app.get("/login", function(req, res){
   res.render("login"); 
});
// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/dreams",
        failureRedirect: "/login"
    }), function(req, res){
});

// logic route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/dreams");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Oneiro Server Has Started!");
});