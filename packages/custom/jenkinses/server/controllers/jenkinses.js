'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Jenkins = mongoose.model('Jenkins'),
    _ = require('lodash');


/**
 * Find jenkins by id
 */
exports.jenkins = function (req, res, next, id) {
    Jenkins.load(id, function (err, jenkins) {
        if (err) return next(err);
        if (!jenkins) return next(new Error('Failed to load jenkins ' + id));
        req.jenkins = jenkins;
        next();
    });
};

/**
 * Create an jenkins
 */
exports.create = function (req, res) {
    var jenkins = new Jenkins(req.body);

    jenkins.save();
    res.jsonp(jenkins);
};

/**
 * Update an jenkins
 */
exports.update = function (req, res) {
    var jenkins = req.jenkins;

    jenkins = _.extend(jenkins, req.body);

    jenkins.save(function (err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot update the jenkins'
            });
        }
        res.json(jenkins);

    });
};

/**
 * Delete an jenkins
 */
exports.destroy = function (req, res) {
    var jenkins = req.jenkins;

    jenkins.remove(function (err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot delete the jenkins'
            });
        }
        res.json(jenkins);

    });
};

/**
 * Show an jenkins
 */
exports.show = function (req, res) {
    res.json(req.jenkins);
};

/**
 * List of Jenkinses
 */
exports.all = function (req, res) {
    Jenkins.find().sort('-created').exec(function (err, jenkinses) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list the Jenkinses'
            });
        }
        res.json(jenkinses);

    });
};


/**
 * Check connection to selected website
 */

exports.status = function (req, res) {
    var http = require('http');
    var jenkins = req.jenkins;

    http.get(jenkins.url, function (res) {
        console.log('Got response: ' + res.statusCode);
        var jenkins = req.jenkins;

        if (res.statusCode === 200) {
            console.log('Zmień na online');
            jenkins.Online = true;
        } else {
            console.log('Zmień na offline');
            jenkins.Online = false;
        }

        jenkins = _.extend(jenkins, jenkins);
        jenkins.save();

    }).on('error', function (e) {
        console.log('Got error: ' + e.message);
    });

    res.json(jenkins.Online);
};