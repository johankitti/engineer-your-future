'use strict';
var express = require('express');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var Wiki = require("wikijs");

// Setup server
var app = express();

app.use("/d3", express.static(__dirname + "/web/d3"));
app.use("/data", express.static(__dirname + "/web/data"));
app.use("/img", express.static(__dirname + "/web/img"));
app.use("/js", express.static(__dirname + "/web/js"));
app.use("/stylesheets", express.static(__dirname + "/web/stylesheets"));
app.use("/html", express.static(__dirname + "/web/html"));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var WORKERS = process.env.WEB_CONCURRENCY || 1;

var server = app.listen(process.env.PORT || 8111, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Engineer your future app is listening at http://%s:%s', host, port);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// STATIC CONTENT
app.all("/", function(req, res, next) {
	res.sendfile("index.html", { root: __dirname + "/web/html" });
});

// API
app.get('/api/wiki:query', function(req, res) {
	var query = req.params.query;
	wiki.page(query).then(function(page) {
		console.log('PAGE: ' + page);
		page.summary().then(function(summary) {
			res.send(summary);
		});
	}, function(reason) {
		res.send('');
	});
});

var wiki = new Wiki();
