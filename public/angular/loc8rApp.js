angular.module('loc8rApp', [])

var _isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var formatDistance = function () {
  return function (distance) {
    var numDistance, unit;
    if (distance && _isNumeric(distance)) {
      if (distance > 1) {
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'km';
      } else {
        numDistance = parseInt(distance * 1000,10);
        unit = 'm';
      }
      return numDistance + unit;
    } else {
      return "?";
    }
  };
};

var ratingStars = function () {
  return {
    // restrict: 'EA',
    scope: {
      thisRating : '=rating'
    },
    // template : "{{ thisRating }}"
    templateUrl: '/angular/rating-stars.html'
  };
};

//Adding hard-coded data into the Angular scope. That means we are making ata available for a certain access level.
//A controller handles a scope We attach the data to the scope so that the view can use it. The conroller pushes data into the view . We have to define the controller in the view to bing the controller and view together
var locationListCtrl = function($scope, loc8rData) { 
  $scope.message = "Searching for nearby places";
  loc8rData
    .success(function(data){ // the Http service doesnt return a data put invokes a success or erro 
       $scope.message = data.length > 0? "": "No location found";
       console.log('test')
       $scope.data = { locations: data };

  })
    .error(function (e) {
       $scope.message = "Sorry, something's gone wrong";
    });
}; 

//var _isNumeric = function(n){
  //return !isNaN(parseFloat(n)) && isFinite(n);// _isNumeric helper function is copied directly from Express code
//};
//var formatDistance = function(){
  //return function(distance){ //To be used as Angular filter formatDistance function must return a function that accepts a distance parameter rather than accepting itself
    //var numDistance, unit;
    //if ((distance) && _isNumeric(distance)){
      //if(distance > 1){// if suplied distance is over 10000 convert to KM
        //numDistance = parseFloat(distance).toFixed(1);
        //unit = 'km';
       //}else{
       // numDistance = parseInt(distance*1000,10);
        //unit = 'm';
     //  }
       //return numDistance + unit;// I like this
     //} else{
      //return "?";
     //}
   //};
//};

//var formatDistance = function(){
  //return function(distance){ //To be used as Angular filter formatDistance function must return a function that accepts a distance parameter rather than accepting itself
    //var numDistance, unit;
    //if ((distance) && _isNumeric(distance)){
      //console.log(distance)
      //if(distance > 1){// if suplied distance is over 10000 convert to KM
        //numDistance = parseFloat(distance).toFixed(1);
        //unit = 'km';
       //}else{
        //numDistance = parseInt(distance*1000,10);
        //unit = 'm';
       //}
       //return numDistance + unit;// I like this
     //} else{
      //return "?";
     //}
   //};
//};

//var ratingStars = function() {
  //return {
    //scope: {
      //thisRating: '=rating'
    //},
   // templateUrl: '/angular/rating-stars.html' //This is the input from the model into the view
  ///};
//};

var loc8rData = function($http) {
  return $http.get('/api/locations?lng=-0.79&lat=51.3&maxDistance=200000000');
};

angular
  .module('loc8rApp')
  .controller('locationListCtrl', locationListCtrl)
  .filter('formatDistance', formatDistance)
  .directive('ratingStars', ratingStars)
  .service('loc8rData', loc8rData);

//Some notes - I like the way the data was hardcoded - the results we expect and we solved the problem backward. L5 - Pass sevice name into controller function as parameter L6- // Invoked loc8rdata service which returned $http.get call L7 // Remember that scope.data means the data avaialable to this scope. Call service, which will then return data L47 // Paaing he http service(that is used to make request to api) into the data service