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
exports.jenkins = function(req, res, next, id) {
  Jenkins.load(id, function(err, jenkins) {
    if (err) return next(err);
    if (!jenkins) return next(new Error('Failed to load jenkins ' + id));
    req.jenkins = jenkins;
    next();
  });
};

/**
 * Create an jenkins
 */
exports.create = function(req, res) {
  var jenkins = new Jenkins(req.body);

  jenkins.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot save the jenkins'
      });
    }
    res.json(jenkins);

  });
};

/**
 * Update an jenkins
 */
exports.update = function(req, res) {
  var jenkins = req.jenkins;

  jenkins = _.extend(jenkins, req.body);

  jenkins.save(function(err) {
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
exports.destroy = function(req, res) {
  var jenkins = req.jenkins;

  jenkins.remove(function(err) {
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
exports.show = function(req, res) {
  res.json(req.jenkins);
};

/**
 * List of Jenkinses
 */
exports.all = function(req, res) {
  Jenkins.find().sort('-created').exec(function(err, jenkinses) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the Jenkines'
      });
    }
    res.json(jenkinses);

  });
};
