#!/usr/bin/env node

var mongoose = require('mongoose'); 
var Loc  = mongoose.model('Location');

var sendJSONresponse = function(res, status, content){
  res.status(status);
  res.json(content);
};

//Adding and saving a subdocument
var doAddReview = function(req, res, location){//When provided with a parent document ...
  if(!location){
    sendJSONresponse(res, 404, {
      "message": "locationid not found"
    });
  } else{
    location.reviews.push({ //push new data into subdocument array
      author: req.body.author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });
    location.save(function(err,location){
      var thisReview;
      if(err){
        sendJSONresponse(res, 400, err);//Mongoose validation errors are returned through error object following attempted save action.
      } else{
        updateAverageRating(location._id);// On successful save operation call function to update average rating
        thisReview = location.reviews[location.reviews.length -1];//Retrieve last review added to array and return it as JSON confirmation response.
        sendJSONresponse(res,201, thisReview);
      }
    });
  }
};

var updateAverageRating = function(locationid){
  Loc
    .findById(locationid)
    .select('rating reviews')
    .exec(
      function(err, location){
        if(!err){
          doSetAverageRating(location);
        }
      });
};

var doSetAverageRating = function(location){
  var i, reviewCount, ratingAverage, ratingTotal;
  if(location.reviews && location.reviews.length>0){
    reviewCount = location.reviews.length;
    ratingTotal = 0;
    for (i=0; i< reviewCount; i++){
      ratingTotal= ratingTotal + location.reviews[i].rating; //Loop through review subdocuments adding up ratings
    }
    ratingAverage = parseInt(ratingTotal / reviewCount, 10);//Calculate average rating value
    location.rating = ratingAverage;//Update rating value of parent docummnt
    location.save(function(err){//save parent
      if(err){
        console.log(err);
      }else{
        console.log("Average rating updated to", ratingAverage);
      }
    });
  }
}
//POST REVIEW ..
module.exports.reviewsCreate = function(req, res) {  //placeholder
  if(req.params.locationid){ //check that locationid exists in request parameters
  Loc
   .findById(req.params.locationid)
   .select('reviews')
   .exec(
      function(err, location){
        if(err){
          sendJSONresponse(res, 404, err);
        } else {
          doAddReview(req, res, location); // successful find operation will call new function to add review, passing request, response, and location objects.
        }
      }
    );
    
    } else  {
      sendJSONresponse(res, 404, {
        "message": "Not found, locationid required"
      });// if Mongoose returned an error, send it as 404 response and exit controller using return statement.
    }
};


//Calling new function from each controller function

//GET ONE REVIEW
module.exports.reviewsReadOne = function(req, res) {  //placeholder
if(req.params && req.params.locationid && req.params.reviewid){ //check that locationid exists in request parameters
  Loc
   .findById(req.params.locationid)// First find the documents
   .select('name reviews') //Add Mongoose select method to model query, saating that we want to get name of location and its reviews
   .exec(
      function(err, location){
        var response,review;
        if(!location){
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if(err){
          sendJSONresponse(res, 400, err)
          return;
        }
        if(location.reviews && location.reviews.length >0){ //Check that returned location has reviews
          review = location.reviews.id(req.params.reviewid); //Use mongoose subdocument.id method as a helper for searching for matching id. This means that the document is stored in it.
          if(!review){// if review isnt found returnn an appropriate response
            sendJSONresponse(res, 404, {
              "message": "reviews not found"
        });
      }else{ // if review is found build response object returning review and location name and ID
        response= {
          location : {
            name: location.name,
            id : req.params.locationid
          },
          review : review
        };
        sendJSONresponse(res, 200, response);
      }
    } else{
      sendJSONresponse(res,404,{ // if no reviews are found return an appriate error message
        "message":"No reviews found"
      });
    }
  }
);
} else{
    sendJSONresponse(res, 404,{
    "message":"Not found,locationid and reviewid are both required"
    });
  }
};
 

module.exports.reviewsUpdateOne = function(req, res) {  //placeholder
  if(!req.params.locationid|| !req.params.reviewid){
    sendJSONresponse(res, 404,{
      "message" : "Not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc
     .findById(req.params.locationid)
     .select('reviews')
     .exec( //executing to the database
        function(err, location){
          var thisReview;
            if(!location){
              sendJSONresponse(res, 404,{
                "message": "locaionid not found"
              });
              return;
            } else if(err) {
               sendJSONresponse(res, 400, err);
               return;
            }
            if(location.reviews && location.reviews.length > 0) {
                thisReview = location.reviews.id(req.params.reviewid); // Find subdocument
                if(!thisReview){
                  sendJSONresponse(res, 404, {
                    "message" : "reviewid not found"
                  });
                } else{ // Make changes to subdocument from supplied form data
                  thisReview.author = req.body.author;
                  thisReview.rating = req.body.rating;
                  thisReview.reviewText = req.body.reviewText;
                  location.save(function(err, location){ //save parent document
                    if(err){
                      sendJSONresponse(res, 404, err); // Return a JSON response, sending subdocument object on basis of successful save
                    } else{
                        updateAverageRating(location._id);
                        sendJSONresponse(res, 200, thisReview);// Reurn a JSON response, sending subdocument object on basis of successful save
                    }
                  });
                }
            } else{
              sendJSONresponse(res, 404, {
                "message": "No review to update"
              });
        }
     }
     );
};

module.exports.reviewsDeleteOne = function(req, res) {  //placeholder
  if(!req.params.locationid|| !req.params.reviewid){
    sendJSONresponse(res, 404,{
      "message" : "Not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc
     .findById(req.params.locationid) //Find relevant parent document
     .select('reviews')
     .exec( //executing to the database
        function(err, location){
            if(!location){ // First checking if the location is present
              sendJSONresponse(res, 404, {
                "message": "locaionid not found"
              });
              return;
            } else if(err) {
               sendJSONresponse(res, 400, err);
               return;
            }
            if(location.reviews && location.reviews.length > 0) {
                if(!location.reviews.id(req.params.reviewid)){
                  sendJSONresponse(res, 404, {
                    "message" : "reviewid not found"
                  });
                } else{ // Find and delete relevant subdocument in one step
                  location.reviews.id(req.params.reviewid).remove();// save parent document
                  location.save(function(err){
                    if(err){
                      sendJSONresponse(res, 404, err);
                    } else{
                      updateAverageRating(location._id);
                      sendJSONresponse(res, 204, null);
                    }
                  })
        }
     } else{
      sendJSONresponse(res, 404, {
        "message": "No review to delete"
      });
     }
    }
  );
};