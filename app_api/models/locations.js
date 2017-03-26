var mongoose = require('mongoose');
//Schema for reviews
var reviewSchema = new mongoose.Schema({
  author: {type:String, required: true},
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  reviewText : {type:String, required: true},
  createdOn: { //CreatedOn doesnt need to be required because Mongoose automatically populates it whwn a new review is created.
    type: Date,
    "default": Date.now
  }
});
//Schema for opening times
var openingTimeSchema = new mongoose.Schema({
  days:{
    type: String, 
    required: true
  },
  opening: String,
  closing: String,
  closed: {
    type: Boolean, 
    required: true
  }
});
var locationSchema = new mongoose.Schema({ //Main location schema definition
  name: {
    type: String, 
    required: true
  },
  address: String,
  rating: {
    type: Number, 
    "default": 0,
    min: 0,
    max: 5
  },
  facilities: [String],
  coords: {
    type: [Number],
    index: '2dsphere', 
    required: true
  },// Use 2dsphere to add GeoJSON longitude and latitude coordinate pairs
  openingTimes: [openingTimeSchema], //Reference opening times and reviews schema to add nested subdocuments
  reviews:[reviewSchema]
});

mongoose.model('Location', locationSchema);
