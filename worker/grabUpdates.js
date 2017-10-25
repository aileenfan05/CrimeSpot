const request = require('request');
const config = require('../config.js');
var db = require('../db/index.js');
let getCrimeUpdate = function (cb) {

	let options = {
    url: `https://data.sfgov.org/resource/cuks-n6tp.json?$order=date DESC&$limit=10`,
    headers: {
      'User-Agent': 'request',
      'app_tocket': 'S5H1R2bs9xHbbNHRkWPGaYlzC'
    }
  };

  function callback (err, res, body) {
  	if (err) {
  		return cb(err);
  	}
  	var info = JSON.parse(body);
  	//console.log(info);
  	cb(null, info);
  }
  request(options, callback);
};

getCrimeUpdate(function(err, result) {
	if (err) {
		return console.log('error in worker');
	}
	// db.insertCrime(result, function (err, res) {
	// 	if (err) {
	// 		return;
	// 	} 
	// 	console.log(res);
	// });
	result.map(item => {
		//console.log('hi', item);
		//db.insertCrime(item);
		db.insertCrime(item, function (err, res) {
			if (err) {
				console.log('err');
				return;
			} 
			return console.log('inserted');
		});
	});
});

module.exports.getCrimeUpdate = getCrimeUpdate;