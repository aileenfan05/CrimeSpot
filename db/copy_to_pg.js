var fs = require('fs');
var pg = require('pg');
var copyFrom = require('pg-copy-streams').from;


var connectionString = 'postgres://udv2cni4e5ngd0:p9f26ed218ab6e7a78ac79730bd93a74839aad3394addf9baf51fa22c43ac0aec@ec2-54-156-238-89.compute-1.amazonaws.com:5432/d677d1saangfcr?ssl=true';
var client = new pg.Client(connectionString);
client.connect();

var stream = client.query(copyFrom("COPY incident(uuid, category, date, pd_district, resolution) from STDIN DELIMITER ',' CSV HEADER"));
var fileStream = fs.createReadStream('./transformed_v1.csv')
fileStream.on('error', function() {
	console.log("error")
});
stream.on('error', function() {
	console.log("error")
});
stream.on('end', function() {
	console.log("done")
});
fileStream.pipe(stream);

