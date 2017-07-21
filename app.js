var express = require('express');
var app = express();
var raspicam = require('raspicam');
var moment = require('moment');

var port = process.env.PORT || 80;
var busy = false;
var filename = '';
var vidcam;

app.get('/', function (req, res) {
  res.send('Camera Functions!<br> 1. <a href="./capture">capture</a> <br> 2. <a href="./capturevid">start video</a> <br> 3. <a href="./stopvid">stop video</a><br> 4. <a href="./starttimelapse">start timelapse</a> <br> 5. <a href="./stoptimelapse">stop timelapse</a>');
});

app.get('/capture', function(req, res) {
  if(!busy) capturePhoto(req, res);
  else{
     var issuccess = encodeURIComponent('false');
     res.redirect('/?success=' + issuccess);
  }
});

app.get('/capturevid', function(req, res) {
  if(!busy) captureVideo(req, res);
  else {
     var issuccess = encodeURIComponent('false');
     res.redirect('/?success=' + issuccess);
  }
});

app.get('/stopvid', function(req, res) {
  if(busy) stopVideo(req,res);
  else{ 
     var issuccess = encodeURIComponent('false');
     res.redirect('/?success=' + issuccess);
  }
});

app.get('/starttimelapse', function(req, res) {
  if(!busy) startTimelapse(req, res);
  else {
     var issuccess = encodeURIComponent('false');
     res.redirect('/?success=' + issuccess); 	
  }
});

app.get('/stoptimelapse', function(req, res) {
  if(busy) stopTimelapse(req, res);
  else  {
     var issuccess = encodeURIComponent('false');
     res.redirect('/?success=' + issuccess);
  }
});


function startTimelapse(req, res) {
  busy = true;
  var current_time = Date.now();
  var current_time_str = moment(current_time).format("MMDDYYYYHHmmss");
  filename = "IMGTL_" + current_time_str  +"%d.jpg";

  vidcam = new raspicam({
        mode: "timelapse",
        output: __dirname + "/camera/" + filename,
        timeout: 0,
        width: 1280,
        height: 720,
        encoding: "jpg",
        quality: 60,
        nopreview: true,
	timelapse: 20000,
  });
  vidcam.start();
  var isrecording = encodeURIComponent('true');
  res.redirect('/?recording=' + true);
}

function stopTimelapse(req, res) {
  vidcam.stop();
  busy = false;

  var issuccess = encodeURIComponent('true');
  var file = encodeURIComponent(filename);
  res.redirect('/?success=' + issuccess + '&filename=' + file);
}

function stopVideo(req,res) {
  vidcam.stop();
  busy = false;

  var issuccess = encodeURIComponent('true');
  var file = encodeURIComponent(filename);
  res.redirect('/?success=' + issuccess + '&filename=' + file);
}

function captureVideo(req, res) {
  var current_time = Date.now();
  var current_time_str = moment(current_time).format("MMDDYYYYHHmmss");
  filename = "VID_" + current_time_str  +".h264";
  vidcam = new raspicam({
  	mode: "video",
	output: __dirname + "/camera/" + filename,
	nopreview: true,
	timeout: 0,
	vstab: true,
        //framerate: 60,
  });

  var isrecording = encodeURIComponent('true');
  res.redirect('/?recording=' + true);	  
  //res.send("recording!");
  busy = true;

  vidcam.start();
  vidcam.on("stop", function(){
  });
  
  vidcam.on("exit", function(){
  });
}

function capturePhoto(req, res) {
  var current_time = Date.now();
  var current_time_str = moment(current_time).format("MMDDYYYYHHmmss");
  filename = "IMG_" + current_time_str  +".jpg";

  var camera = new raspicam({
	mode: "photo",
	output: __dirname + "/camera/" + filename,
	timeout: 1000,
	width: 1280,
	height: 720,
        encoding: "jpg",
	quality: 100,
	nopreview: true,
	vstab: true,
        //colfx: "128:128" -- b&W
	//imxfx: "sketch"  
  });
  busy = true;
  camera.start();

  camera.on("exit", function() {
     busy = false;
     
     var issuccess = encodeURIComponent('true');
     var file = encodeURIComponent(filename);
     
     res.redirect('/?success=' + issuccess + '&filename=' + file);
  });
}

app.listen(port);
console.log('server listening on port:' + port);

exports = module.exports = app;
