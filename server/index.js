const express = require('express');
const app = express();
const bodyParser = require('body-parser');  
const url = require('url');  
const querystring = require('querystring'); 
var db = require('../db/index.js');
var redis = require('../db/redis.js');
app.use(bodyParser.json());
app.get('/crime/:str', function (req, res) {
	var string = req.params.str;
	//console.log(req.params);
	var q = querystring.parse(string); 
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
		res.send(result);
	});
	//res.send('hi');
})

app.get('/crime/default/:str', function(req, res) {
	//get default
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
			return res.send(JSON.stringify(result));
		}

		// TODO: Monitoring cache miss
		console.log('cache miss');
		db.getCache(district, function(err, result) {
			if (err) {
				// TODO: Monitoring DB error
				return res.send(err);
			}

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

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
