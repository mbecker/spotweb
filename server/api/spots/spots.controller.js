'use strict';


const firebase = require("firebase");
const gcloud = require('google-cloud');
var storage = gcloud.storage;
var gcs = storage({
  projectId: 'safaridigitalapp',
  keyFilename: './server/config/owner.json'
});
const url = require('url');


var config = require('../../config/environment');


// Get list of spotss
exports.index = function(req, res) {

  res.render('spots.handlebars');

};

exports.spot = function(req, res) {

	firebase.database().ref('/park/' + req.params.park + '/' + req.params.type + '/'  + req.params.spotId).once('value').then(function(snapshot) {
	  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	  var images 	= snapshot.val().images;
	  var parkName 	= snapshot.val().location.parkName;
	  const title 	= snapshot.val().name;
	  const tags 	= snapshot.val().tags;

	  var tagsArr = ''

	  Object.keys(tags).forEach(function(key) {
		  tagsArr = tagsArr + ', ' + tags[key]
		});
	  

	  // ToDo: Check urlSIgned.expires < Date.now()
	  if (snapshot.val().urlSigned && snapshot.val().urlSigned.url) {
	  	console.log(":: SIGNED URLD EXISTS ::");
	  	return res.render('spots.handlebars', { fullUrl: fullUrl, title: title, parkName: parkName, tags: tagsArr.slice(2), url: snapshot.val().urlSigned.url });
	  }

	  console.log("-- GET SIGNED URL --");

	  var imageURL = snapshot.val().url;
	  var pathname = url.parse(imageURL).pathname;
	  var arr = pathname.slice(1).split("/");
	  console.log(pathname);
	  console.log(arr);
	  var bucket = gcs.bucket('safaridigitalapp.appspot.com/' + arr[0]);
	  
	  const expires = '03-17-2025';
	  var config = {
		  action: 'read',
		  expires: expires
		};
		var file = bucket.file(arr[1]);
		file.getSignedUrl(config, function(err, url) {
		  if (err) {
		    console.error(err);
		    res.render('spots.handlebars', { error: err });
		    return;
		  }
		  res.render('spots.handlebars', { parkName: parkName, tags: tagsArr.slice(2), url: url });
		  firebase.database().ref('/park/' + req.params.park + '/' + req.params.type + '/'  + req.params.spotId + '/urlSigned').set({
		    url: url,
		    expires: expires
		  });
		});
	  
	});

};


/* 
* Example 
*/

// exports.index = function(req, res) {

// 	var token = (req.param('token')) 



// 	firebase.auth().verifyIdToken(token).then(function(decodedToken) {
// 	    var uid = decodedToken.uid;
// 	    var db = firebase.database();
// 	    var ref = db.ref("userData").child(uid);


// 	    ref.once("value", function(snapshot) {
// 	    	//output the data
// 	    	if (snapshot.val())
// 	    		res.json({status: 1, userObject: snapshot.val()});
// 	    	else
// 	    		res.json({status: 0});
// 	    });

// 	}).catch(function(error) {
// 	    // Handle error
// 	 	var ret = {'status': 0};

// 		if (config.env == 'development'){
// 			ret['info'] = error;
// 		}
// 		res.json(ret);
// 	});





// };