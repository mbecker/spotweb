/**
 * Main application routes
 */

'use strict';

var path = require('path');
var config = require('./config/environment');
var firebase = require("firebase");
//initlize firebase
firebase.initializeApp(config.firebase);


module.exports = function(app) {

	app.get('/', function (req, res) {
	  res.render('home.handlebars', { home: true });
	});
	
	// Insert routes below
	app.use('/spots', require('./api/spots'));
  

};
