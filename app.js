'use strict';
var express = require('express');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
// Setup server
var app = express();

app.use("/d3", express.static(__dirname + "/web/d3"));
app.use("/data", express.static(__dirname + "/web/data"));
app.use("/img", express.static(__dirname + "/web/img"));
app.use("/js", express.static(__dirname + "/web/js"));
app.use("/stylesheets", express.static(__dirname + "/web/stylesheets"));
app.use("/", express.static(__dirname + "/web"));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var WORKERS = process.env.WEB_CONCURRENCY || 1;

var server = app.listen(process.env.PORT || 9000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Engineer your future app is listening at http://%s:%s', host, port);
});

// STATIC CONTENT
app.all("/", function(req, res, next) {
	res.sendfile("index.html", { root: __dirname + "/web" });
});

// TRANSPORT API
app.get('/api/transport/:dest/:station/:exclude', function(req, res) {
  var url = '/api2/TravelplannerV2/trip.json?key=' + config.transportation.apiKey +
	'&originId=' + req.params.station + '&destId=' + req.params.dest +
	req.params.exclude;
  var options = {
    host: 'api.sl.se',
    path: url
  };

  http.request(options, function(response) {
    var str = '';

    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      res.send(str);
    });
  }).end();
});
