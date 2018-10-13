var mongoose = require("mongoose");
var dreams = require("./models/dreams");
var Comment   = require("./models/comment");

var data = [
    {
        name: "dream 1", 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_txw6exXJ9hlXvFvuaZsOqcZMs8FirboQijJ39KfjIRz4GxRpFrzZFtpezg",
        test:"https://apple.com",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Dream 2", 
        image: "data:image/jpeg;base64,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",
        test:"https//facebook.com",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    }
]

function seedDB(){
   //Remove all dreams
   dreams.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed dreams!");
         //add a few dreams
        data.forEach(function(seed){
            dreams.create(seed, function(err, dreams){
                if(err){
                    console.log(err)
                } else {
                    console.log("added a dreams");
                    //create a comment
                    Comment.create(
                        {
                            text: " but I wish there was internet",
                            author: "kk"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                                dreams.comments.push(comment);
                                dreams.save();
                                console.log("Created new comment");
                            }
                        });
                }
            });
        });
    }); 
    //add a few comments
}

module.exports = seedDB;
