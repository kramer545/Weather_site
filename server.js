// Allow Node.js to require and load `.marko` files
require("marko/node-require");
 
const express = require("express");
const markoExpress = require("marko/express");
const request = require('request');
const bodyParser = require('body-parser');

const indexTemplate = require("./index");
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const app = express(); 
// enables res.marko(template, data)
app.use(markoExpress());

app.get("/", function(req, res) {
	res.marko(indexTemplate);
});

app.post("/", urlencodedParser, function(req, res) {
	const city = req.body.city;
	const weatherKey = req.body.weatherKey
	const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${weatherKey}`
	request(url, function (err, response, body) {
		if (err){
			console.log(err);
			return res.marko(indexTemplate, {error: 'Error, please try again'});
		}
		
		const weather = JSON.parse(body);
		if (weather.message) {
			return res.marko(indexTemplate, {error: weather.message});
		} else if (weather.main == undefined){
			return res.marko(indexTemplate, {error: 'Error, please try again'});
		}

		// Fahrenheit to Celsius
		const degCel = Math.ceil((weather.main.temp - 32.0) * (5/9));
		const data = {
			degCel: degCel,
			weather: weather,
			weatherKey: weatherKey
		};

		res.marko(indexTemplate, data);
	});
});
 
app.listen(8080);
console.log("\nServer started,");
console.log("Visit localhost:8080 to view");