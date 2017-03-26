var request = require('request'); // Request is used to make API calls

var apiOptions = { //set default server URL for local development
  server :"http://localhost:3000"
};
if(process.env.NODE_ENV === 'production'){
  apiOptions.server = "https://damp-thicket-63414.herokuapp.com "; //if the application running in production mode set different base URL; change to be live address of application
}

//Rendering function for homelist

var renderHomepage = function(req, res, responseBody){
  var message;
  if(!(responseBody instanceof Array)){// Instance of array is used to know whether responseBody is an array. If the response isnt array, set message, and set responseBody to be empty array.
    message = "API lookup error"; //We set it has an empty array to avoid errors associated to string.
    responseBody = [];
  } else{
    if(!responseBody.length){ // if response is array with no length, set message
      message = "No place found nearby";
    }
  }
  res.render('locations-list',{ 
    title:'Loc8r- find a place to work with wifi',
    pageHeader:{
      title:'Loc8r',
      strapline:'Find places to work with wifi near you!'
    },
    sidebar: "looking for wifi and a seat? Lock8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint?Let Loc8r help you find the place you're looking for.",
    locations: responseBody,//the location array takes in the response from the API 
    message: message //Add message to variables to send to view
  });
};

//

//RenderDetailPage function

var renderDetailPage = function(req,res, locDetail){//Added a new parmeter for data in function definition
  res.render('location-info',{
    title: locDetail.name, //Reference speific items of data as needed in function
    pageHeader: {title:locDetail.name},
    sidebar:{
    context:'Starcups is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
    callToAction:'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
  },
    location: locDetail //Pass full locDetail data object to view, containing all details
}) 
  };

var getLocationInfo = function(req, res, callback){
  var requestOptions, path;
  path = "/api/locations/" + req.params.locationid;
  requestOptions= {
    url : apiOptions.server + path,
    method : "GET",
    json:{}
  };
  request(
    requestOptions,
    function(err, response, body){
      var data = body;
      if(response.statusCode === 200){
        data.coords ={
          lng: body.coords[0],
          lat: body.coords[1]
        };
        callback(req, res, data); //Following successful API response, invoke callback instead of named function
      } else{
        _showError(req, res, response.statusCode);
      }
    }
    );
};
/*GET home page*/
module.exports.homelist = function(req, res){
  var requestOptions, path;
  path = '/api/locations'; //set path for API request (server is already set at top of file
  requestOptions = { 
    url : apiOptions.server + path,
    method: "GET",
    json: {},
    qs : {
      lng: -0.9690884,//determines response.
      lat: 51.455041,
      maxDistance : 20000
    }
  };
  request( //Making  request to API, sending through request options
    requestOptions,
    function(err, response, body){//The call back receives the response from the API
      var i, data; // We initialised this variables to be used in sorting the response 
      data = body;
      if (response.statusCode === 200 && data.length){
      for(i=0; i<data.length; i++){
        data[i].distance = _formatDistance(data[i].distance);// loop through array fromatting distance value of location
      }
    }
      renderHomepage(req, res, data); // Send modified data to be rendered instead of original body
    }
  );
};
var _formatDistance = function(distance){
  var numDistance, unit;
  if(distance > 10000){// if suplied distance is over 10000 convert to KM
    numDistance = parseFloat(distance/1000).toFixed(1);
    unit = 'km';
  }else{
    numDistance = parseInt(distance);
    unit = 'm';
  }
  return numDistance + unit;// I like this
};


//Error handling function for API status codes that arent 200

var _showError = function(req, res, status){ //If status passed through is 404, set title an content for page
  var title, content;
  if(status === 404){
    title="404. page not found";
    content ="Oh dear. Looks like we cant find this page. Sorry.";
  } else{ // Otherwise set a generic catch- all message
    title = status + ", something's gone wrong";
    content = "Something, somewhere, has gone just a little bit wrong.";
  }
  res.status(status);
  res.render('generic-text',{ // Send data to view to be compiled and sent to browser
    title : title,
    content : content
  });
};

/*GET 'Location info' page*/
module.exports.locationInfo = function(req, res){// Call new function from controller, remembering to pass it req and res paramters.
  getLocationInfo(req, res, function(req, res, responseData){
    renderDetailPage(req, res, responseData);
 });
};

var renderReviewForm = function(req, res, locDetail){// Update renderReview-Form function to accept new parameter containing 
  res.render('location-review-form',{
    title:'Review ' + locDetail.name + 'on Loc8r',
    pageHeader: { title: 'Review ' + locDetail.name}, //Swap out hard-coded data for data references
    error: req.query.err
  });
};

/*GET 'Add review' page*/
module.exports.addReview = function(req, res){ //In locationInfo controller call getLocationInfor function, passing  callback function that will call renderDetailPage function upon completion
  getLocationInfo(req, res, function(req, res, responseData){// Also call getLocationInfo from addreview controller, but this time pass renderReviewForm in callback
    renderReviewForm(req, res, responseData);
 }); //Call new function from within addReview controller, passing through same parameters  
};
// Set up a clear controller ready to query the API
/*POST 'a review' page*/
module.exports.doAddReview = function(req, res){
  var requestOptions, path, locationid, postdata;
  locationid = req.params.locationid;// Get location ID from URL to construct API URL
  path ="/api/locations/" + locationid +'/reviews';
  postdata = {// Create data object to send to API using submitted form data
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText : req.body.review
  };
  requestOptions = {//Set request options, including path, setting POST method and passing submitted form data into json parameter
    url: apiOptions.server + path,
    method : "POST",
    json : postdata
  };
  if (!postdata.author || !postdata.rating || !postdata.reviewText){
    res.redirect('/location/' + locationid + '/reviews/new?err=val');//The err is used to send a signal to thview that an error message should pop out on the view
  }else{
  request( // Make the request
    requestOptions,
    function(err, response, body){
      console.log(err);
      if(response.statusCode === 201){
        res.redirect('/location/' + locationid);
      }else if(response.statusCode === 400 && body.name && body.name ===
        "ValidationError"){//Add in check to see if status is 400, if body has a name, and if that name is ValidationError
        res.redirect('/location/' + locationid +'/reviews/new?err=val');//If true direct to review form, passing an error flag in query string
      }
      else{
        _showError(req, res, response.statusCode); //Redirect to Details page if review was added successfully or show an error if API returned an error..
      }
    }

    );
  }
};


