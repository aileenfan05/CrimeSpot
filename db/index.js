var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/crimedb';

var client = new pg.Client(connectionString);
client.connect();

var getCrime = function(district, category, granularity, fromDate, toDate, callback) {
	if (category === 'All') {
		var params = [granularity, district, fromDate, toDate];
		var query = "select date_trunc($1, date) as month, count(*) from incident \
							WHERE pd_district = $2 AND date >= to_timestamp($3, 'YYYY-MM-DD') AND date < to_timestamp($4, 'YYYY-MM-DD') \
							GROUP BY month ORDER BY month";
	} else {
		var params = [granularity, district, category, fromDate, toDate];
		var query = "select date_trunc($1, date) as month, count(*) from incident \
							WHERE pd_district = $2 AND category = $3 AND date >= to_timestamp($4, 'YYYY-MM-DD') AND date < to_timestamp($5, 'YYYY-MM-DD') \
							GROUP BY month ORDER BY month";
	}
	client.query(query, params, (err, result) => {
		console.log(err)
		if (err) {
			//console.log('error getting crime data', err);
			return callback(err, null);
		} 
		//console.log(result.rows);
		return callback(null,result.rows)
	});
}

var getCache = function(district, callback) {
	var params = [district];
	var query = "select date_trunc('week', date) as month, count(*) from incident \
			where pd_district = $1 And date >= to_timestamp('2017-05-01', 'YYYY-MM-DD') AND date < to_timestamp('2017-08-01', 'YYYY-MM-DD') \
			GROUP BY month ORDER BY month";
	client.query(query, params, (err, result) => {
		console.log(err)
		if (err) {
			//console.log('error getting crime data', err);
			return callback(err, null);
		} 
		//console.log(result.rows);
		return callback(null,result.rows)
	});
}
// getCache( 'MISSION', function (err, result) {
// 	if (err) {
// 		return;
// 	}
// 	console.log(result);
// });
module.exports = {
	client,
	getCrime,
	getCache
}

