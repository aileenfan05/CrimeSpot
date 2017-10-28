
var request = require ('request');
setInterval(() => { 
	request('http://localhost:3000/crime/default/district=RICHMOND', (err, res, body) => {
		if (err) {
			return console.log('err calling server get', err);
		}
		return console.log(body);
	})
}, 3000);
