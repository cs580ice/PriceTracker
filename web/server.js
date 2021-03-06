/* This is the server main start sequence and also the RESTful interface for
 * Price Tracker. Its functions are serving the client's static files and
 * forwarding REST requests to the proper request handlers.
 */
/* global load, loadConfig, __dirname */

require('./base.js');

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

app.set('x-powered-by', false);

// Template settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static content settings
app.use(express.static(path.join(__dirname, 'static')));

// Parse POST application/json
app.use(bodyParser.json());

// ************************
// Add URL mapping: begin
// ************************
// Track product
app.post('/productid', load('web.controller.TrackController'));

// Get product history
app.get("/productid/:productId", load("web.controller.HistoryRequestHandler"));

/* The Data Extractor uses this to figure out which products to track. */
app.get("/productid", load("web.controller.GetTrackedListHandler"));

// ************************
// Add URL mapping: end
// ************************

// Handle 404
app.get('*', function(req, res)
{
	res.status(404);
	if (req.accepts('html'))
	{
		res.render('404', {url: req.url});
		return;
	}

	if (req.accepts('json'))
	{
		res.send({error: 'Service not found:' + req.url});
		return;
	}

	res.send('Service not found: ' + req.url);
});

app.listen(loadConfig('server').port, function()
{
	console.log('Server is listening on port ' + loadConfig('server').port);
});

// Initialize database connection pool
load('web.domain.MongoDB').connection.init()
	.catch((error) => {
		console.log(error);
	});
