const express = require('express');
const app = express();
const bodyParser = require('body-parser');  
const url = require('url'); 
const querystring = require('querystring'); 
var db = require('../db/index.js');
//const worker = require('../worker/grabUpdates'); 
var redis = require('../db/redis.js');
//var loadTester = require('./loadTester.js');
var statsD = require('node-statsd');
const statsDClient = new statsD({
  host: 'statsd.hostedgraphite.com',
  port: 8125,
  prefix: process.env.HOSTEDGRAPHITE_APIKEY
});

app.use(bodyParser.json());


app.get('/crime/:str', function (req, res) {
	var string = req.params.str;
	//console.log(req.params);
	var q = querystring.parse(string); 

	console.log(q, req.params);

	//default values mean that str only contain district info? 
	var district = q.district;
	var category = q.category;
	var granularity = q.granularity;
	var fromDate = q.from;
	var toDate = q.to;
	console.log('after parse', fromDate, toDate);
	
	db.getCrime(district, category, granularity, fromDate, toDate, function (err, result) {
		if (err) {
			return res.send(err);
		}
		//console.log(result);
		res.end(JSON.stringify(result));
	});
	//res.send('hi');
})

app.get('/crime/default/:str', function(req, res) {
	//get default
	//graphite set up
	var start = Date.now();
	statsDClient.increment('.service.crime.query.all');

	var string = req.params.str;
	var q = querystring.parse(string); 
	var district = q.district;
	console.log(typeof district, district);

	redis.getCrime(district, function(err, result) {
		if (err) {
			return res.send(err)
		}

		if (result.length > 0) {
			//monitor cache hit
			console.log('cache hit');
			const latency = Date.now() - start;
			statsDClient.histogram('.service.crime.query.latency_ms', latency);
    		statsDClient.increment('.service.crime.query.cache');
    		console.log(latency);
			return res.send(JSON.stringify(result));
		}

		// TODO: Monitoring cache miss
		console.log('cache miss');
		db.getCache(district, function(err, result) {

			if (err) {
				// TODO: Monitoring DB error
				return res.send(err);
			}
			const latency = Date.now() - start;
			statsDClient.histogram('.service.crime.query.latency_ms', latency);
			statsDClient.increment('.service.crime.query.db');
			res.end(JSON.stringify(result));

			// Background cache set
			redis.setCrime(district, JSON.stringify(result), function (err, result) {
				if (err) {
					// TODO: Add monitoring for cache.set error
					console.log(err);
					return;
				}

				// TODO: add monitoring for cache.set success
			});
		});
	});
});

let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})
