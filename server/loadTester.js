
var request = require ('request');
setInterval(() => { 
	request('https://crime-spot.herokuapp.com/crime/default/district=RICHMOND', (err, res, body) => {
		if (err) {
			return console.log('err calling server get', err);
		}
		return console.log(body);
	})
}, 10);
