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
		   		console.error(err);
		   		return returnError('Photo not found ...');
		   	} else {
		   		const url = 'https://storage.googleapis.com/safaridigitalapp.appspot.com/' + arr[0] + '/' + arr[1];
		   		
		   		if(resized){
			   		firebase.database().ref('/park/' + req.params.park + '/' + req.params.type + '/'  + req.params.id + '/images/resized/375x300/public').set({
						url: url
					}, function(){
						// ToDo: return res.semd doesn't work. Why?
					});
		   		} else {
		   			firebase.database().ref('/park/' + req.params.park + '/' + req.params.type + '/'  + req.params.id + '/images').update({
						public: url
					}, function(){
						// ToDo: return res.semd doesn't work. Why?
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
	  			return gcloudImage(snapshot.val().images['gcloud'], false)
	  			break;
	  		case 'checkResizedGcloudImage':
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
	   if(!snapshot.val().images.resized['350x300']){
	   	// ERROR 3: No resized 375x300 images
	   	// handleError('checkGcloudImage');
	   	return res.render('spots.handlebars', { error: 'Photo not found ...' });	
	   }
	   if (!snapshot.val().images.resized['375x300']['public']){
	   		// ERROR 4: No resized 375x300 public images
	   		return res.render('spots.handlebars', { error: 'Photo not found ...' });	
	   } 

	   // RETURN: SHOW public resized image
	   returnImage(snapshot.val().images.resized['375x300']['public']);

	  
	});

};