
var request = require ('request');
setInterval(() => { 
	request('https://crime-spot.herokuapp.com/crime/zipcode=94131', (err, res, body) => {
		if (err) {
			return console.log('err calling server get', err);
		}
		return console.log(body);
	})
}, 20);

// request('https://crime-spot.herokuapp.com/crime/zipcode=94121', (err, res, body) => {
// 	if (err) {
// 		return console.log('err calling server get', err);
// 	}
// 	setInterval(() => { 
// 	request('https://crime-spot.herokuapp.com/crime/zipcode=94121&category=ASSAULT&granularity=month&from=2017-01-01&to=2017-04-01', (err, res, body) => {
// 		if (err) {
// 			return console.log('err calling server get', err);
// 		}
// 		return console.log(body);
// 	})
// 	}, 200);
// 	return console.log(body);
// })