'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchedulerSchema = new Schema({
    title: String,
    date: String,
    done: Boolean,
    scheduled: Boolean,
    saved: Boolean,
    pipeline: [{
      label: String,
      jobName: String,
      jenkinsName: String,
      buildParameters: String,
      status: String,
      params: String
    }]
  })
  ;

module.exports = mongoose.model('Scheduler', SchedulerSchema);
