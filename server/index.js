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


app.get('/crime/*', function (req, res) {
	var q = req.query;
	// var q = querystring.parse(string); 
	console.log(q);
	var start = Date.now()
	//count all querys
	statsDClient.increment('.service.crime.query.all');

	console.log(typeof q.zipcode, q.zipcode);
	var zipcode = q.zipcode;
	var district = 'MISSION';
	if (zipcode === undefined || zipcode === '94114' || zipcode === '94110') {
		district = 'MISSION';
	} else if (zipcode === '94122' || zipcode === '94116' || zipcode === '94132') {
		district = 'TARAVAL';
	} else if (zipcode === '94112' || zipcode === '94127' || zipcode === '94131') {
		district = 'INGLESIDE';
	} else if (zipcode === '94117' || zipcode === '94131') {
		district = 'PARK';
	} else if (zipcode === '94121' || zipcode === '94118' || zipcode === '94129') {
		district = 'RICHMOND';
	} else if (zipcode === '94123' || zipcode === '94115' || zipcode === '94130') {
		district = 'NORTHEN';
	} else if (zipcode === '94109' || zipcode === '94133' || zipcode === '94111' || zipcode === '94108' || zipcode === '94104') {
		district = 'CENTRAL';
	} else if (zipcode === '94102') {
		district = 'TENDERLOIN';
	} else if (zipcode === '94105' || zipcode === '94158' || zipcode === '94103') {
		console.log('in SOUTHERN');
		district = 'SOUTHERN';
	} else if (zipcode === '94134' || zipcode === '93124' || zipcode === '94107') {
		district = 'BAYVIEW';
	} 
	
// ******************************DEFAULT*********************************************
 
	//default values mean that str only contain district info? 
	// var district = q.district || 'MISSION';
	//var category = q.category;
	if (q.granularity === undefined || q.from === undefined || q.to === undefined) {
		console.log('default value');
		redis.getCrime(district, function(err, result) {
			if (err) {
				statsDClient.increment('.service.crime.query.fail');
				return res.send(err);
			}

			if (result.length > 0) {
				//monitor cache hit
				console.log('cache hit');
				const latency = Date.now() - start;
				statsDClient.timing('.service.crime.query.latency_ms', latency);
	    	statsDClient.increment('.service.crime.query.cache');
	    		console.log(latency);
				return res.send(JSON.stringify(result));
			}

			// TODO: Monitoring cache miss
			console.log('cache miss');
			db.getCache(district, function(err, result) {

				if (err) {
					// TODO: Monitoring DB error
					statsDClient.increment('.service.crime.query.fail');
					return res.send(err);
				}
				const latency = Date.now() - start;
				statsDClient.timing('.service.crime.query.latency_ms', latency);
				statsDClient.increment('.service.crime.query.db');
				res.end(JSON.stringify(result));

				// Background cache set
				var expire = 21600 // expire in 6 hrs
				redis.setCrime(district, JSON.stringify(result), expire, function (err, result) {
					if (err) {
						// TODO: Add monitoring for cache.set error
						statsDClient.increment('.service.crime.query.fail');
						console.log(err);
						return;
					}

				});
			});
		});
	} 
// ******************************CUSTOM*********************************************
 
	else {
		var granularity = q.granularity || 'week';
		var fromDate = q.from;
		var toDate = q.to;

		console.log('after parse', fromDate, toDate);
		
		redis.getCrime(JSON.stringify(q), function(err, result) {
			if (err) {
				statsDClient.increment('.service.crime.query.fail');
				return res.send(err);
			}

			if (result.length > 0) {
				//monitor cache hit
				console.log('cache hit');
				const latency = Date.now() - start;
				statsDClient.timing('.service.crime.query.latency_ms', latency);
	    	statsDClient.increment('.service.crime.query.cache');
	    		console.log(latency);
				return res.send(JSON.stringify(result));
			}

			// TODO: Monitoring cache miss
			console.log('cache miss');

			db.getCrime(district, granularity, fromDate, toDate, function (err, result) {
				if (err) {
					console.log('error getting crime data in server');
					const latency = Date.now() - start;
					statsDClient.increment('.service.crime.query.fail');
					return res.send(err);
				}
				console.log('successfully getting crime data in server');
				const latency = Date.now() - start;
				statsDClient.timing('.service.crime.query.latency_ms', latency);
				res.end(JSON.stringify(result));

				var expire = 10 // expire in 10s
				redis.setCrime(JSON.stringify(q), JSON.stringify(result), expire, function (err, result) {
					if (err) {
						// TODO: Add monitoring for cache.set error
						statsDClient.increment('.service.crime.query.fail');
						console.log(err);
						return;
					}

					// TODO: add monitoring for cache.set success
				});
			});
			// db.getCache(district, function(err, result) {

			// 	if (err) {
			// 		// TODO: Monitoring DB error
			// 		statsDClient.increment('.service.crime.query.fail');
			// 		return res.send(err);
			// 	}
			// 	const latency = Date.now() - start;
			// 	statsDClient.timing('.service.crime.query.latency_ms', latency);
			// 	statsDClient.increment('.service.crime.query.db');
			// 	res.end(JSON.stringify(result));

			// 	// Background cache set
			// 	var expire = 21600 // expire in 6 hrs
			// 	redis.setCrime(district, JSON.stringify(result), expire, function (err, result) {
			// 		if (err) {
			// 			// TODO: Add monitoring for cache.set error
			// 			statsDClient.increment('.service.crime.query.fail');
			// 			console.log(err);
			// 			return;
			// 		}

			// 		// TODO: add monitoring for cache.set success
			// 	});
			// });
		});

		// db.getCrime(district, granularity, fromDate, toDate, function (err, result) {
		// 	if (err) {
		// 		console.log('error getting crime data in server');
		// 		const latency = Date.now() - start;
		// 		statsDClient.increment('.service.crime.query.fail');
		// 		return res.send(err);
		// 	}
		// 	console.log('successfully getting crime data in server');
		// 	const latency = Date.now() - start;
		// 	statsDClient.timing('.service.crime.query.custom.latency_ms', latency);
		// 	return res.send(JSON.stringify(result));
		// });
	}
	
	//res.send('hi');
})

// app.get('/crime/default/:str', function(req, res) {
// 	//get default
// 	//graphite set up
// 	var start = Date.now();
// 	statsDClient.increment('.service.crime.query.all');

// 	var string = req.params.str;
// 	var q = querystring.parse(string); 
// 	var district = q.district;
// 	console.log(typeof district, district);

// 	redis.getCrime(district, function(err, result) {
// 		if (err) {
// 			return res.send(err)
// 		}

// 		if (result.length > 0) {
// 			//monitor cache hit
// 			console.log('cache hit');
// 			const latency = Date.now() - start;
// 			statsDClient.timing('.service.crime.query.latency_ms', latency);
//     		statsDClient.increment('.service.crime.query.cache');
//     		console.log(latency);
// 			return res.send(JSON.stringify(result));
// 		}

// 		// TODO: Monitoring cache miss
// 		console.log('cache miss');
// 		db.getCache(district, function(err, result) {

// 			if (err) {
// 				// TODO: Monitoring DB error
// 				return res.send(err);
// 			}
// 			const latency = Date.now() - start;
// 			statsDClient.timing('.service.crime.query.latency_ms', latency);
// 			statsDClient.increment('.service.crime.query.db');
// 			res.end(JSON.stringify(result));

// 			// Background cache set
// 			redis.setCrime(district, JSON.stringify(result), function (err, result) {
// 				if (err) {
// 					// TODO: Add monitoring for cache.set error
// 					console.log(err);
// 					return;
// 				}

// 				// TODO: add monitoring for cache.set success
// 			});
// 		});
// 	});
// });

let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})
