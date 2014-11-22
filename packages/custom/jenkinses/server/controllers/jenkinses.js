'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Jenkins = mongoose.model('Jenkins'),
    _ = require('lodash'),
    jenkinsAPI = require('jenkins-api'),
    request = require('request');


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
    var jenkins = req.jenkins;
    var url = jenkins.url;

    request(url, res, function (error, response) {
        if (!error && response.statusCode === 200) {
            console.log('Zmień na online');
            jenkins.ConnectionStatus = {Online: true, timestamp: Date.now()};
        } else {
            console.log('Zmień na offline');
            jenkins.ConnectionStatus = {Online: false, timestamp: Date.now()};
        }
        jenkins.save();
        console.log(jenkins.ConnectionStatus.Online);
        res.json(jenkins.ConnectionStatus.Online);
    });
};

exports.jobs = function (req, res) {
    // #TODO verify that url contains jenkins server
    var jenkins = req.jenkins;
    var api = jenkinsAPI.init(req.jenkins.url);
    api.all_jobs(function (err, data) {
        if (err) {
            return console.log(err);
        }
        jenkins.jobs = data;
        jenkins = _.extend(jenkins, jenkins);
        jenkins.save();
    });
};

exports.job_info = function (req, res) {
    var jenkins = req.jenkins;
    var api = jenkinsAPI.init(req.jenkins.url);
    api.job_info('TEST', function (err, data) {
        if (err) {
            return console.log(err);
        }
        jenkins.jobs = data;
        jenkins = _.extend(jenkins, jenkins);
        jenkins.save();
    });
};

exports.job_enable = function (req, res) {
    var api = jenkinsAPI.init(req.jenkins.url);
    api.enable_job(req.params.jobName, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
    });
};

exports.job_disable = function (req, res) {
    var api = jenkinsAPI.init(req.jenkins.url);
    api.disable_job(req.params.jobName, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
    });
};

exports.job_delete = function (req, res) {
    var api = jenkinsAPI.init(req.jenkins.url);
    api.delete_job(req.params.jobName, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
    });
};

exports.job_build = function (req, res) {
    var api = jenkinsAPI.init(req.jenkins.url);
    api.build(req.params.jobName, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
    });
};


exports.plugins = function (req, res) {
    var jenkins = req.jenkins;
    var url = jenkins.url;

    console.log('URL: ' + url);
    url += '/pluginManager/api/json?depth=4';

    request(url, res, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            jenkins.plugins = JSON.parse(body).plugins;
            jenkins = _.extend(jenkins, jenkins);
            jenkins.save();
            res.send(JSON.parse(body).plugins);
        }
    });
};

exports.jobsAPI = function (req, res) {
    /*
     Jenkins.findById('546c9b0e32a93e5109006f4f', function (err, jenkins) {
     res.json(jenkins.jobs);
     })
     */
    res.json(req.jenkins.jobs);
};

exports.pluginsAPI = function (req, res) {
    /*
     Jenkins.findById('546c9b0e32a93e5109006f4f', function (err, jenkins) {
     res.json(jenkins.plugins);
     })
     */
    res.json(req.jenkins.plugins);
};

