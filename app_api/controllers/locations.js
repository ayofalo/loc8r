#!/usr/bin/env node

var mongoose = require('mongoose'); //gives controller access to the database connection
var Loc = mongoose.model('Location'); // this brings in the Location model so that we can interact with the Locations collection. The Loc is the JSON form of the model

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var theEarth = (function() {//Which kind of function is this
  var earthRadius = 6371; //KM, MILES IS 3959 Define fixed value for radius of Earth

  var getDistanceFromRads = function(rads) {
    return parseFloat(rads * earthRadius);
  };

  var getRadsFromDistance = function(distance) {
    return parseFloat(distance / earthRadius);
  };

  return {
    getDistanceFromRads: getDistanceFromRads,
    getRadsFromDistance: getRadsFromDistance
  };
})();


//placeholder

//Calling new function from each controller function


module.exports.locationsCreate = function(req, res) {
  Loc.create({ //Apply create method to model
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","), //Create array of facilities by splitting a comma-seperated list
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)], //Parse coordinates from strings to numbers
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed,
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }]
  }, function(err, location) { // Supply callback function, containing appropriate responses for success and failure
    if (err) {
      sendJSONresponse(res, 400, err);
    } else {
      sendJSONresponse(res, 201, location);
    }
  });
};

module.exports.locationsListByDistance = function(req, res) {
  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);
  var point = {
    type: "Point",
    coordinates: [lng, lat]
  };
  var geoOptions = {//Works in metres
    spherical: true,
    maxDistance: 20000,
    num: 10
  };
  if ((!lng && lng!==0)||(!lat && lat!==0))  {
    sendJSONresponse(res, 404, {
      "message": "lng, lat and maxDistance query parameters are all required"
    });
    return;
  }
  Loc.geoNear(point, geoOptions, function(err, results, stats) {
    var locations = [];
    if (err) {
      sendJSONresponse(res, 404, err);
    } else {
        results.forEach(function(doc) {
           locations.push({
              distance: doc.dis,
              name: doc.obj.name,
              address: doc.obj.address,
              rating: doc.obj.rating,
              facilities: doc.obj.facilities,
              _id: doc.obj._id
            });
          });
         sendJSONresponse(res, 200, locations);
    }
  });
};

//Get a new location by idc
module.exports.locationsReadOne = function(req, res) {
  if (req.params && req.params.locationid) { //check that locationid exists in request parameters
    Loc
      .findById(req.params.locationid)
      .exec(function(err, location) {
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 404, err); // if Mongoose returned an error, send it as 404 response and exit controller using return statement.
          return;
        }
        sendJSONresponse(res, 200, location); //If Mongoose didnt error, continue as before and send location object in a 200 response
      });

  } else {
    sendJSONresponse(res, 404, {
      "message": "No locationid in request" //if request parameters didnt include locationid, send appropriate 404 response
    });
  }
};

// PUT - Update/Making changes to an existing document in MongoDB
module.exports.locationsUpdateOne = function(req, res) {
  if (!req.params.locationid) { // if the location id is absent, run the code below
    sendJSONresponse(res, 404, {
      "message": "Not found, location id is required"
    });
    return;
  }
  Loc
    .findById(req.params.locationid)
    .select('-reviews -rating') //Do not select reviews and rating
    .exec( //excuting the query
      function(err, location) { //takes in location and err
        if (!location) { // if the location specified is not present return location id not found
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) { //if an err is returned give err resonse
          sendJSONresponse(res, 400, err);
          return;
        }
        //Update paths with values from submitted form
        location.name = req.body.name; // The new name taken from the form is put into the location.name
        location.address = req.body.address; // The new address taken from the form is put into the location.address
        location.facilities = req.body.facilities.split(","); // The new facilities taken from the form is put into the location.facilities
        location.coords = [parseFloat(req.body.lng),
          parseFloat(req.body.lat)
        ];
        location.openingTimes = [{
          days: req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body.closed1,
        }, {
          days: req.body.days2,
          opening: req.body.openinng2,
          closing: req.body.closing2,
          closed: req.body.closed2,
        }];
        locaion.save(function(err, location) { //save instance
          if (err) { //Send appropriate response, depending on outcome of save operation
            sendJSONresponse(res, 404, err);
          } else {
            sendJSONresponse(res, 200, location);
          }
        });
      }
    );
};

module.exports.locationsDeleteOne = function(req, res) {
  var locationid = req.params.locationid;
  if (locationid) {
    Loc
      .findByIdAndRemove(locationid) // Call findByIdAndRemove method, passing in locationid
      .exec( // Execute method
        function(err, location) {
          if (err) {
            sendJSONresponse(res, 404, err); //Respond with success or failure
            return;
          }
          sendJSONresponse(res, 204, null);
        }
      );
  } else {
    sendJSONresponse(res, 404, {
      "message": "No locationid"
    });
  }
};
