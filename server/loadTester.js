
var request = require ('request');
setInterval(() => { 
	request('https://crime-spot.herokuapp.com/crime/district=MISSION&category=ASSAULT&granularity=month&from=2017-01-01&to=2017-04-01', (err, res, body) => {
		if (err) {
			return console.log('err calling server get', err);
		}
		return console.log(body);
	})
}, 100);
