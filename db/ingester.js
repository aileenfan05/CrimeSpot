//https://github.com/mysqljs/mysql
//https://www.npmjs.com/package/fast-csv
// var mysql = require('mysql');

// var connection = mysql.createConnection({
// 	host : 'localhost',
// 	user : 'root',
// 	password: '',
// 	database: 'test'
// });

var uuidv4 = require('uuid/v4');
var db = require('./index')
var csv = require("fast-csv");
var fs = require("fs");
var csvStream = csv.createWriteStream({headers: true}),
	writableStream = fs.createWriteStream("./db/transformed_v1.csv");

writableStream.on("finish", function() {
	console.log("done!");
});
csvStream.pipe(writableStream);

var counter = 0;

csv
 .fromPath("./db/Police_Department_incidents.csv", {headers: true})
 .on("data", function(data){
    var values = {
    	uuid: uuidv4(), 
    	category: data['category'], 
    	date: data['date'], 
    	pd_district: data['pd_district'], 
    	resolution: data['resolution'] 
    };
    csvStream.write(values);
    counter++
    console.log(counter)
 })
 .on("end", function(){
     console.log("done");
     csvStream.end();
 });
 
 //var string = INSERT INTO incident(uuid, category, date, pd_district, resolution) VALUES('112233444455','WARRANTS','2017-04-19','MISSION','ARREST, BOOKED') ON CONFLICT WHERE category='WARRANTS' AND resolution='ARREST, BOOKED' DO NOTHING