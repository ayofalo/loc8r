#!/usr/bin/env node
var express = require('express');
var router = express.Router();
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

/*Locations pages*/
router.get('/', ctrlLocations.homelist);
router.get('/location/:locationid',ctrlLocations.locationInfo);
router.get('/location/:locationid/reviews/new', ctrlLocations.addReview);// Insert locationid parameter into existing route for review form 
router.post('/location/:locationid/reviews/new', ctrlLocations.doAddReview);//Create new route on same URL but using POST method and referencing different controller.

/*Otherpages*/

router.get('/about', ctrlOthers.about);


module.exports = router;
