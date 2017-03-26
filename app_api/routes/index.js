#!/usr/bin/env node

var express = require('express');
var router  = express.Router(); //What does this router does
var ctrlLocations = require('../controllers/locations');
var ctrlReviews = require('../controllers/reviews');

//locations

router.get('/locations', ctrlLocations.locationsListByDistance); // Defined routes for locations
router.post('/locations', ctrlLocations.locationsCreate);
router.get('/locations/:locationid', ctrlLocations.locationsReadOne);
router.put('/locations/:locationid', ctrlLocations.locationsUpdateOne);
router.delete('/locations/:locationid', ctrlLocations.locationsDeleteOne);

//perform this When you see .... do .....
//reviews

router.post('/locations/:locationid/reviews', ctrlReviews.reviewsCreate); //defined routs for reviews
router.get('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsReadOne);
router.put('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsUpdateOne);
router.delete('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsDeleteOne);

module.exports = router;  // Export routesr