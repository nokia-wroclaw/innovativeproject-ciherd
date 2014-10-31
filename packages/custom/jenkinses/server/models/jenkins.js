'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Jenkins Schema
 */
var JenkinsSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  token: {
    type: String,
  }
});

/**
 * Validations
 */
JenkinsSchema.path('name').validate(function(name) {
  return !!name;
}, 'name cannot be blank');

JenkinsSchema.path('url').validate(function(url) {
  return !!url;
}, 'url cannot be blank');

/**
 * Statics
 */
JenkinsSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Jenkins', JenkinsSchema);
