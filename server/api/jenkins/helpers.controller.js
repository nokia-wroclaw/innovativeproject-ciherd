'use strict';

var _ = require('lodash');
var request = require('request');

exports.get_jenkins = function (req, res) {
  var user_id = req.body.user_id;
  var api_token = req.body.api_token;
  var split = req.body.url.split('//');
  var url = split[0] + '//' + user_id + ':' + api_token + '@' + split[1] + '/api/json?depth=2';

  request.get(url, res, function (error, response) {
    if (!error && response.statusCode === 200 && response.headers.hasOwnProperty('x-jenkins')) {
      console.log('ok');
      res.send(response.body);
    } else {
      console.log('problems with restart');
    }
  });
};

exports.get_plugins = function (req, res) {
  var user_id = req.body.user_id;
  var api_token = req.body.api_token;
  var split = req.body.url.split('//');
  var url = split[0] + '//' + user_id + ':' + api_token + '@' + split[1] + '/pluginManager/api/json?depth=2';

  request.get(url, res, function (error, response) {
    if (!error && response.statusCode === 200) {
      console.log('ok');
      if (response.headers.hasOwnProperty('x-jenkins')) {
        console.log('dziala jeszcze lepiej');
        res.send(response.body);
      } else {
        console.log('not working');
        res.json();
      }
    } else {
      console.log('problems with restart');
    }
  });
};
