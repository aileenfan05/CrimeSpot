var redis = require("redis"),
    client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
    console.log("Error " + err);
});

// client.set("string key", "string val", redis.print);
// client.hset("hash key", "hashtest 1", "some value", redis.print);
// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
// client.hkeys("hash key", function (err, replies) {
//     console.log(replies.length + " replies:");
//     replies.forEach(function (reply, i) {
//         console.log("    " + i + ": " + reply);
//     });
//     client.quit();
// });


// This will return a JavaScript String
// client.get("foo_rand000000000000", function (err, reply) {
//     console.log(reply.toString()); // Will print `OK`
// });
var setCrime = function (key, value, callback) {
	// EXPRIE IN 6 HRS
	client.set(key, value, 'EX', 21600, function (err, result) {
		if (err) {
			console.log('error in caching result', err);
			return callback(err);
		}
		callback(null, result);
	});
};

var getCrime = function (query, callback) {
	client.get(query, function (err, result) {
		if (err) {
			console.log('error in caching', err);
			return callback(err);
		}
		if (result) {
			return callback(null, JSON.parse(result));
		}
		callback(null, []);
	});
};
// setCrime("foo_rand000000000000", "ok" ,function(err, result) {
// 	if (err) {
// 		return console.log('no such thing');
// 	}
// 	console.log('got the data', result);
// });

module.exports = {
	client,
	getCrime, 
	setCrime
}
