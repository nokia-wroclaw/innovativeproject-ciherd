'use strict';

// Requires meanio
var mean = require('meanio');
// Requires cron
var CronJob = require('cron').CronJob;

var i = 1;
new CronJob('*/30 * * * * * ', function () {
    console.log('1: ' + i);
    console.log('2: ' + i);
    i += 1;
}, null, true);

mean.serve({}, function (app, config) {
    var port = config.https && config.https.port ? config.https.port : config.http.port;
    console.log('Mean app started on port ' + port + ' (' + process.env.NODE_ENV + ')');
});
