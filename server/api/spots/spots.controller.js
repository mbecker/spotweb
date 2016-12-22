'use strict';


const firebase = require("firebase");
const gcloud = require('google-cloud');
const storage = gcloud.storage;
const gcs = storage({
  projectId: 'safaridigitalapp',
  keyFilename: './server/config/mbecker.json'
});
const url = require('url');

const tools = require('../../tools');
const config = require('../../config/environment');

// Get list of spotss
exports.index = function(req, res) {

  res.render('spots.handlebars');

};

exports.spot = function(req, res) {

	

	  let returnImage = function(url) {
	  	return res.render('spots.handlebars', { title: title, parkName: parkName, tags: tags.slice(2), url: url });
	  }

	  let returnError = function(error) {
	  	return res.render('spots.handlebars', { error: error });
	  }

	  let gcloudImage = function(gcloudURL, resized) {
	  	console.log("### CHECK GCLOUD ###");
		var pathname = url.parse(gcloudURL).pathname;
		var arr = pathname.slice(1).split("/");
		var bucket = gcs.bucket('safaridigitalapp.appspot.com/');
		var file = bucket.file(arr[0] + '/' + arr[1]);
		file.makePublic(function(err, apiResponse) {
		   	if(err){
		   		console.log("TEST 2");
		   		console.error(err);
		   		return returnError('Photo not found ...');
		   	} else {
		   		const url = 'https://storage.googleapis.com/safaridigitalapp.appspot.com/' + arr[0] + '/' + arr[1];
		   		
		   		if(resized){
		   			// Update firebase entity with public storage url
		   			console.log("TEST 12");
			   		firebase.database().ref('/park/' + req.params.park + '/' + req.params.type + '/'  + req.params.id + '/images/resized/375x300/public').set({
						url: url
					}, function(){
						console.log("CALLBACK TEST 123");
						return handleError('checkPublicImage');
					});
		   		} else {
		   			console.log("TEST 14");
		   			firebase.database().ref('/park/' + req.params.park + '/' + req.params.type + '/'  + req.params.id + '/images').update({
						public: url
					}, function(){
						console.log("CALLBACK TEST 123");
						
					});
		   		}
		   		
		   		
		   	}
		   });
	  }	  

	  var title;
	  var parkName;
	  var title;
	  var tags = '';

	firebase.database().ref('/park/' + req.params.park + '/' + req.params.type + '/'  + req.params.id).once('value').then(function(snapshot) {
	  	
	  	let handleError = function(error) {
	  	switch (error) {
	  		case 'checkPublicImage':
	  			if(!snapshot.val().images['public']) {
	  				handleError('checkGcloudImage');
	  			}
	  			returnImage(snapshot.val().images['public']);
	  			break;
	  		case 'checkGcloudImage':
	  			if(!snapshot.val().images['gcloud']) {
	  				returnError('Photo not found ...');
	  			}
	  			console.log("### TEST 2212 ###");
	  			return gcloudImage(snapshot.val().images['gcloud'], false)
	  			break;
	  		case 'checkResizedGcloudImage':
	  			console.log("### TEST 23232323 ###");
	  			if(!snapshot.val().images.resized['375x300']['gcloud']) {
	  				returnError('Photo not found ...');
	  			}
	  			gcloudImage(snapshot.val().images.resized['375x300']['gcloud'], true);
	  			break;
	  	}
	  }
	
	


		if(!snapshot.exists()){
			// ERROR 0: Item does not exsist
	   		return res.render('spots.handlebars', { error: 'Spot not found ...' });
		}

	  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	  parkName 	= "null";
	  title 	= snapshot.val().name;
	  const tagsAll   = snapshot.val().tags;

	  Object.keys(tagsAll).forEach(function(key) {
		  tags = tags + ', ' + tagsAll[key]
		});
	  
	  if (snapshot.val().name){
	  	title = snapshot.val().name;	
	  }
	  if ( snapshot.val().location && snapshot.val().location['parkName']){
	  	parkName = snapshot.val().location.parkName;	
	  }

	  /*
	   * CHECK IMAGE 375x300
	   */
	   if (!snapshot.val().images) {
	   	// ERROR 1: No images
	   	return returnError('Photo not found ...');
	   }
	   if(!snapshot.val().images.resized){
	   	// ERROR 2: No resized images
	   	return handleError('checkPublicImage');
	   }
	   if(!snapshot.val().images.resized){
	   	// ERROR 3: No resized 375x300 images
	   	// handleError('checkGcloudImage');
	   	console.log(snapshot.val().images.resized)
	   	return res.render('spots.handlebars', { error: 'Photo not found ...' });	
	   }
	   if (!snapshot.val().images.resized['375x300']['public']){
	   		// ERROR 4: No resized 375x300 public images
	   		return res.render('spots.handlebars', { error: 'Photo not found ...' });	
	   		/* 
	   		var pathname = url.parse(imageURL).pathname;
	   		var arr = pathname.slice(1).split("/");
	  		var bucket = gcs.bucket('safaridigitalapp.appspot.com/');
	  		var file = bucket.file(arr[0] + '/' + arr[1]);
	  		file.makePublic(function(err, apiResponse) {
			   	if(err){
			   		console.error(err);
			   		return res.render('spots.handlebars', { error: 'Photo not found ...' });
			   	} else {
			   		const url = 'https://storage.googleapis.com/safaridigitalapp.appspot.com/' + arr[0] + '/' + arr[1];
			   		
			   		// Update firebase entity with public storage url
			   		firebase.database().ref('/park/' + req.params.park + '/' + req.params.type + '/'  + req.params.spotId + '/urlpublicstorage375x300').set({
					    url: url
					  });	

			   		return res.render('spots.handlebars', { parkName: parkName, tags: tagsArr.slice(2), url: url });
			   	}
			   });
			   */
	   } 

	   // RETURN: SHOW public resized image
	   returnImage(snapshot.val().images.resized['375x300']['public']);

	   /*
	   else {

		  if (snapshot.val().urlpublicstorage && snapshot.val().urlpublicstorage.url) {
		  	return res.render('spots.handlebars', { fullUrl: fullUrl, title: title, parkName: parkName, tags: tagsArr.slice(2), url: snapshot.val().urlpublicstorage.url });
		  }

		  var imageURL = snapshot.val().url;
		  var pathname = url.parse(imageURL).pathname;
		  var arr = pathname.slice(1).split("/");
		  var bucket = gcs.bucket('safaridigitalapp.appspot.com/');
		  var file = bucket.file(arr[0] + '/' + arr[1]);

			file.makePublic(function(err, apiResponse) {
		   	if(err){
		   		console.error(err);
		   		res.render('spots.handlebars', { error: 'Photo not found ...' });
		   	} else {
		   		const url = 'https://storage.googleapis.com/safaridigitalapp.appspot.com/' + arr[0] + '/' + arr[1];
		   		res.render('spots.handlebars', { parkName: parkName, tags: tagsArr.slice(2), url: url });
		   		// Update firebase entity with public storage url
		   		firebase.database().ref('/park/' + req.params.park + '/' + req.params.type + '/'  + req.params.spotId + '/urlpublicstorage').set({
				    url: url
				  });	
		   	}
		   });

	   }
	   */

	  

	  
	});

};