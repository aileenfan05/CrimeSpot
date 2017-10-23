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
 
csv
 .fromPath("./db/Police_Incidents2017.csv", {headers: true})
 .on("data", function(data){
    var values = [uuidv4(), data['category'], data['date'], data['pd_district'], data['resolution']];
    db.client.query('INSERT INTO incident(uuid, category, date, pd_district, resolution) VALUES($1,$2,$3,$4,$5)', values, function (error, results, fields) {
  		if (error) throw error;
	  	console.log(results, fields);
	});
 })
 .on("end", function(){
     console.log("done");
 });
 