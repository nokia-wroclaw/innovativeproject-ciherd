/**
 * Socket.io configuration
 */

'use strict';

var _ = require('lodash');
var config = require('./environment');
var mongoose = require('mongoose');
var Jenkins = require('../api/jenkins/jenkins.model');
var request = require('request');
var async = require('async');
var crypto = require('crypto');


module.exports = function (io) {
  // http://www.sebastianseilund.com/nodejs-async-in-practice

  io.on('connection', function (socket) {
    console.log('User connected...');
    setInterval(
      function () {
        Jenkins.find({}, function (err, jenkinses) {
          async.each(jenkinses, function (jenkins, callback) {
            var user_id = jenkins.UserID;
            var api_token = jenkins.APIToken;
            var jobs = jenkins.jobs;
            var plugins = jenkins.plugins;
            var isOnline = jenkins.ConnectionStatus.Online;
            var splitted_url = jenkins.url.split('//');


            var auth_enable = true;
            if (typeof user_id === 'undefined' || typeof api_token === 'undefined') {
              auth_enable = false;
            }

            async.parallel({
                changeConectionStatus: function (callback) {
                  setTimeout(function () {
                    var url = splitted_url.join("//");

                    request(url, function (error, response) {
                      var newIsOnline = !!(!error && response.statusCode === 200);

                      if (isOnline !== newIsOnline) {
                        //noinspection JSUnresolvedFunction
                        Jenkins.findById(jenkins._id, function (err, jenkins) {
                          jenkins.ConnectionStatus.Online = newIsOnline;
                          jenkins.ConnectionStatus.LastUpdated = Date.now();
                          jenkins.save(function (err) {
                          });

                          Jenkins.find({}, function (err, jenkinses) {
                            socket.emit("send::jenkinses", jenkinses);
                          });
                        });
                        callback(null, true);
                      } else {
                        callback(null, false);
                      }
                    });

                  }, 1000);
                },
                jobs: function (callback) {
                  setTimeout(function () {
                    var url;
                    if (auth_enable) {
                      url = splitted_url[0] + '//' + user_id + ':' + api_token + '@' + splitted_url[1] + '/api/json?tree=jobs[name,url,color,buildable,lastSuccessfulBuild[duration,url,timestamp]]';
                    } else {
                      url = splitted_url.join("//") + '/api/json?tree=jobs[name,url,color,buildable,lastSuccessfulBuild[duration,url,timestamp]]';
                    }

                    request(url, function (error, response) {
                      if (!error && response.statusCode === 200) {
                        callback(null, JSON.parse(response.body).jobs)
                      } else {
                        //callback(null, response.statusCode);
                      }
                    });

                  }, 500);
                },
                plugins: function (callback) {
                  setTimeout(function () {
                    var url;
                    if (auth_enable) {
                      url = splitted_url[0] + '//' + user_id + ':' + api_token + '@' + splitted_url[1] + '/pluginManager/api/json?depth=2';
                    } else {
                      url = splitted_url.join("//") + '/pluginManager/api/json?depth=2';
                    }

                    request(url, function (error, response) {
                      if (!error && response.statusCode === 200) {
                        callback(null, JSON.parse(response.body).plugins)
                      } else {
                        //callback(null, response.statusCode);
                      }
                    });

                  }, 500);
                }
              },
              function (err, results) {
                var i;
                for (i = 0; i < jobs.length; i++) {
                  jobs[i] = JSON.parse(JSON.stringify(jobs[i]));
                  delete jobs[i]["_id"];
                }

                for (i = 0; i < results.jobs.length; i++) {
                  results.jobs[i] = JSON.parse(JSON.stringify(results.jobs[i]));
                  if (results.jobs[i]["lastSuccessfulBuild"] === null) {
                    delete results.jobs[i]["lastSuccessfulBuild"];
                  }
                }

                //noinspection JSUnresolvedFunction
                var old_jobs_hash = crypto.createHash('sha1').update(JSON.stringify(jobs)).digest('hex');
                //console.log(JSON.stringify(jobs));
                //console.log(JSON.stringify(results.jobs));
                //noinspection JSUnresolvedFunction
                var new_jobs_hash = crypto.createHash('sha1').update(JSON.stringify(results.jobs)).digest('hex');

                if (old_jobs_hash !== new_jobs_hash) {
                  //console.log("Przed" + jobs.length);
                  //console.log("Po:" + results.jobs.length);
                  //noinspection JSUnresolvedFunction
                  Jenkins.findById(jenkins._id, function (err, jenkins) {
                    jenkins.jobs = results.jobs;
                    jenkins.plugins = results.plugins;
                    jenkins.ConnectionStatus.LastUpdated = Date.now();
                    jenkins.save(function (err) {
                    });

// todo rewrite async sequence to more optimal: emit only one message after iterate over all jenkinses
                    Jenkins.find({}, function (err, jenkinses) {
                      socket.emit("send::jenkinses", jenkinses);
                    });
                  });
                }
              });
            callback();
          });
        });
      }, 800);


    socket.on('get::jenkins', function () {
      Jenkins.find({}, function (err, jenkinses) {
        socket.emit("send::jenkinses", jenkinses);
      });
    });

    socket.on('disconnect', function () {
      console.log('a user disconnect');
      //socket.socket.reconnect();
    });
  });


};
