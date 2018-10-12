var mongoose = require("mongoose");
var dreams = require("./models/dreams");
var Comment   = require("./models/comment");

var data = [
    {
        name: "dream 1", 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp61VZ2IttG-eUgmZ5fWka7viqtI4aDK6FAEAAidYgCfrKckVDkw",
        description: ".."
    },
    {
        name: "Dream 2", 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkEaUZDIry2AF5g3G4_0D_xjNblPQHLxmpvCdcl6dESIgHlSrg4g",
        description: ".."
    },
    {
        name: "Dream 3", 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPHGJ2pJYMJnpWlAD04BVMtD8fqnELjGgeDO96wBLbrKrWjjV_wA",
        description: "..."
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
                    console.log("added a dream");
                    //create a comment
                    Comment.create(
                        {
                            text: "This dream is better",
                            author: "jai"
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
