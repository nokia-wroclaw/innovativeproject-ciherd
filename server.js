'use strict';

// Requires meanio
var mean = require('meanio');

// Requires cron
var CronJob = require('cron').CronJob;

// Requires mongoose
//var mongoose = require('mongoose');


// Creates and serves mean application
mean.serve({/*options placeholder*/}, function (app, config) {
    var port = config.https && config.https.port ? config.https.port : config.http.port;
    console.log('Mean app started on port ' + port + ' (' + process.env.NODE_ENV + ')');
});

/*jshint -W031 */
new CronJob('*/2 * * * * *', function () {
    // Todo 'for jenkins in jenkinses: override latestBuildStatus and ConnectionStatus
}, null, true);

//var db = mongoose.createConnection('mongodb://localhost/mean-dev1');
