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
    description: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true
    },
    // API Token
    UserID: {
        type: String,
        required: true
    },
    APIToken: {
        type: String,
        required: true

    }
});

/**
 * Validations
 */

JenkinsSchema.path('description').validate(function (description) {
    return !!description;
}, 'Description cannot be blank');

JenkinsSchema.path('url').validate(function (url) {
    return !!url;
}, 'URL cannot be blank');

JenkinsSchema.path('UserID').validate(function (UserID) {
    return !!UserID;
}, 'User ID cannot be blank');

JenkinsSchema.path('APIToken').validate(function (APIToken) {
    return !!APIToken;
}, 'API Token cannot be blank');


/**
 * Statics
 */
JenkinsSchema.statics.load = function (id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Jenkins', JenkinsSchema);
