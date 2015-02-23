'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JenkinsSchema = new Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },

  UserID: {
    type: String
  },
  APIToken: {
    type: String
  },

  SSHUsername: {
    type: String
  },
  SSHPassword: {
    type: String
  },
  SSHPort: {
    type: Number
  },

  ConnectionStatus: {
    Online: Boolean,
    LastUpdated: Date
  },
  plugins: [{
    active: Boolean,
    deleted: Boolean,
    downgradable: Boolean,
    enabled: Boolean,
    hasUpdate: Boolean,
    longName: String,
    url: String,
    version: String
  }],
  jobs: [{
    name: String,
    url: String,
    buildable: Boolean,
    color: String,
    lastSuccessfulBuild: {
      duration: Number,
      timestamp: Number,
      url: String
    }
  }
  ]
});


module.exports = mongoose.model('Jenkins', JenkinsSchema);
