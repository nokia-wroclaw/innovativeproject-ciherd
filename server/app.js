/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

var Agenda = require('agenda');

var agenda = new Agenda({db: {address: config.mongo.uri}});

var Scheduler = require('./api/jenkins/scheduler.model');

agenda.define('scheduler', function (job) {
  var id = job.attrs.data.schedulerID;
  console.log("Hello from Scheduler");
  console.log(id);
  Scheduler.findById(id, function (err, data) {
    console.log(data);
  });
});

module.exports.runScheduler = function (data) {
  agenda.now('scheduler', {schedulerID: data});
};


agenda.start();

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if (config.seedDB) {
  require('./config/seed');
}

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: (config.env !== 'production'),
  path: '/socket.io-client',
  forceNew: true,
  setNoDelay: true
});
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});
// Expose app
var exports = module.exports = app;
