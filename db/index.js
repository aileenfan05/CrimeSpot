var pg = require('pg');
// Sets SSL to on for heroku postgres
pg.defaults.ssl = true;
//const worker = require('../worker/grabUpdates'); 
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/crimedb';
var uuidv4 = require('uuid/v4');
var client = new pg.Client(connectionString);
client.connect();
//

var getCrime = function(district, category, granularity, fromDate, toDate, callback) {
	console.log("in getCrime database");
	if (category === 'All') {
		//var params = [granularity, district, fromDate, toDate];
		var query = `select date_trunc('${granularity}', date) as ${granularity}, count(*) from incident \
							WHERE pd_district = '${district}' AND date >= to_timestamp('${fromDate}', 'YYYY-MM-DD') AND date < to_timestamp('${toDate}', 'YYYY-MM-DD') \
							GROUP BY ${granularity} ORDER BY ${granularity}`;
	} else {
		console.log("user wants a specific category")
		//var params = [granularity, district, category, fromDate, toDate];
		var query = `select date_trunc('${granularity}', date) as ${granularity}, count(*) from incident \
							WHERE pd_district = '${district}' AND category = '${category}' AND date >= to_timestamp('${fromDate}', 'YYYY-MM-DD') AND date < to_timestamp('${toDate}', 'YYYY-MM-DD') \
							GROUP BY ${granularity} ORDER BY ${granularity}`;
	}

	console.log("getCrime Query", query);
	client.query(query, (err, result) => {
		console.log("in getCrime query")
		if (err) {
			console.log('error getting crime data', err);
			return callback(err, null);
		} 
		console.log(result.rows);
		return callback(null,result.rows)
	});
}

var getCache = function(district, callback) {
	var params = [district];
	var query = "select date_trunc('week', date) as week, count(*) from incident \
			where pd_district = $1 And date > CURRENT_DATE - INTERVAL '3 months' \
			GROUP BY week ORDER BY week";
	client.query(query, params, (err, result) => {
		//console.log(err)
		if (err) {
			//console.log('error getting crime data', err);
			return callback(err, null);
		} 
		//console.log(result.rows);
		return callback(null,result.rows)
	});
}

var insertCrime = function (item, callback) {
	// TODO 
	//console.log(item);
	var category = item.category;
	var date = item.date;
	var district = item.pddistrict;
	var resolution = item.resolution;
	var params = [category, date, district, resolution];
	var findDup = 'SELECT * FROM incident WHERE category=$1 AND date=$2 AND pd_district=$3 AND resolution=$4';
	client.query(findDup, params, (err, result) => {
		//console.log(err)
		if (err) {
			return callback(err, null);
		} 
		if (result.rows.length === 0) {
			console.log('could not find a record');
			var values = [uuidv4(), category, date, district, resolution];
			client.query('INSERT INTO incident(uuid, category, date, pd_district, resolution) VALUES($1,$2,$3,$4,$5)', values, function (error, results, fields) {
  		if (error) throw error;
	  	callback(null, results);
			});

		} 
		return callback(null,'found dup');
	});
	//console.log(category, date, district,resolution);
}

var getMaxDate = function (callback) {
	client.query('select max(date) from incident', (err, result) => {
		if (err) {
			//console.log('error getting crime data', err);
			return callback(err, null);
		} 
		//console.log(result.rows);
		return callback(null,result.rows)
	});
}

getMaxDate(function(err, result) {
	if (err) {
		return console.log('err', err);
	}
	console.log(result);
});

// var item = {
// 	address: '0 Block of NAPOLEON ST',
//   category: 'ASSAULT',
//   date: '2017-10-10T00:00:00.000',
//   dayofweek: 'Tuesday',
//   descript: 'ATTEMPTED HOMICIDE WITH A GUN',
//   incidntnum: '170826461',
//   location:
//    { type: 'Point',
//      coordinates: [ -122.394477126313, 37.747349510033 ] },
//   pddistrict: 'BAYVIEW',
//   pdid: '17082646104021',
//   resolution: 'NONE',
//   time: '02:18',
//   x: '-122.39447712631312',
//   y: '37.74734951003285'
// }

// insertCrime(item, function (err, result) {
// 	if (err) {
// 		return console.log('err', err);
// 	}
// 	console.log(result);
// })
//insertCrime('hi in insertCrime');
// getCache( 'MISSION', function (err, result) {
// 	if (err) {
// 		return;
// 	}
// 	console.log(result);
// });

// worker.getCrimeUpdate(function(err, result) {
// 	if (err) {
// 		return console.log('error in worker');
// 	}
// 	result.map(item => {
// 		console.log('hi', item);
// 	})
// 	//console.log(result);
// });

module.exports = {
	client,
	getCrime,
	getCache,
	insertCrime,
	getMaxDate
}

//var query = "select date_trunc('week', date) as week, count(*) from incident where pd_district = 'MISSION' And date > CURRENT_DATE - INTERVAL '3 months' GROUP BY week ORDER BY week";

