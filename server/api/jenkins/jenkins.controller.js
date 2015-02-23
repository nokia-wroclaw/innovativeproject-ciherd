'use strict';

var _ = require('lodash');

var Jenkins = require('./jenkins.model');
var Scheduler = require('./scheduler.model');
var request = require('request');
var async = require('async');
var Connection = require('ssh2');
var app = require('../../app.js');

// Show list of all Jenkinses
exports.jenkinses_list = function (req, res) {
  Jenkins.find({}, function (err, things) {
    if (err) res.status(500).json(err);
    res.status(200).json(things);
  });
};

// Create a new Jenkins (Desc, URL, TokenID, UserID)
// Usage: curl -X POST -i --data "url=&user_id=&api_token=" http://localhost:9000/api/jenkinses/
exports.jenkins_create = function (req, res) {
  var jenkins = {};
  var desc = req.body['desc'];
  var url = req.body['url'];
  var user_id = req.body['UserId'];
  var api_token = req.body['APIToken'];
  var ssh_username = req.body['SSHUsername'];
  var ssh_password = req.body['SSHPassword'];
  var ssh_port = req.body['SSHPort'];
  var auth_enable = true;

  if (typeof user_id === 'undefined' || typeof api_token === 'undefined') {
    auth_enable = false;
  }

  async.series([
      function (callback) {
        var url = req.body.url.split("//");

        if (auth_enable) {
          url = url[0] + '//' + user_id + ':' + api_token + '@' + url[1] + '/api/json?tree=jobs[name,url,color,buildable,lastSuccessfulBuild[duration,url,timestamp]]';
        } else {
          url = url.join("//") + '/api/json?tree=jobs[name,url,color,buildable,lastSuccessfulBuild[duration,url,timestamp]]';
        }

        request.get(url, function (error, response) {
          if (!error && response.statusCode === 200) {
            jenkins.jobs = JSON.parse(response.body).jobs;
            callback();
          } else {
            callback('It is not a Jenkins');
          }
        });
      },
      function (callback) {
        var url = req.body.url.split("//");

        if (auth_enable) {
          url = url[0] + '//' + user_id + ':' + api_token + '@' + url[1] + '/pluginManager/api/json?depth=2';
        } else {
          url = url.join("//") + '/pluginManager/api/json?depth=2';
        }

        request.get(url, function (error, response) {
          if (!error && response.statusCode === 200) {
            jenkins.plugins = JSON.parse(response.body).plugins;
            callback();
          } else {
            callback('It is not a Jenkins');
          }

        });
      },
      function (callback) {
        var j = new Jenkins();
        j.description = desc;
        j.url = url;
        j.UserID = user_id;
        j.APIToken = api_token;
        j.SSHUsername = ssh_username;
        j.SSHPassword = ssh_password;
        j.SSHPort = ssh_port;
        j.ConnectionStatus = {
          Online: true,
          LastUpdated: Date.now()
        };
        j.plugins = jenkins.plugins;
        j.jobs = jenkins.jobs;
        j.save(callback);
      }
    ],
    function (err) {
      if (err) res.status(500).json(err);
      res.status(200).json("Jenkinses Added");
    }
  );
};

// Show Jenkins
exports.jenkins_display = function (req, res) {
  var jenkins_id = req.params.id;

  Jenkins.find({_id: jenkins_id}, 'APIToken UserID url description ConnectionStatus', function (err, doc) {
    if (err) res.status(500).json(err);

    res.json(doc[0]);
  });
};

// Update Jenkins
exports.jenkins_update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, jenkins) {
    if (err) res.status(500).json(err);
    if (!jenkins) res.send(404);

    var updated = _.merge(jenkins, req.body);
    updated.save(function (err) {
      if (err) res.status(500).json(err);
      res.status(200).json(jenkins);
    });
  });
};

// Delete Jenkins
exports.jenkins_delete = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err) {
  }).remove(function (err) {
    if (err) res.status(500).json(err);
    res.json(200);
  });
};

// Show last update date for Jenkins
exports.jenkins_lastupdate = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    if (err) {
      res.json(500, {
        error: 'Cannot update the jenkins'
      });
    }
    res.json(doc.ConnectionStatus.LastUpdated);
  });
};

// Show plugins of the Jenkinses
exports.jenkins_plugins_display = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    if (err) {
      res.json(500, {
        error: 'Cannot update the jenkins'
      });
    }
    res.json(doc.plugins);
  });
};

// Show plugin
exports.jenkins_plugin_display = function (req, res) {
  var jenkins_id = req.params.id;
  var plugin_id = req.params['plugin_id'];

  //noinspection JSUnresolvedFunction
  Jenkins.findById(jenkins_id, function (err, doc) {
    if (err) {
      res.json(500, {
        error: 'Cannot update the jenkins'
      });
    }
    res.json(doc.plugins.id(plugin_id));
  });
};

// Delete Job
exports.jenkins_job_delete = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    request.post({
      url: doc.url + '/job/' + req.params.jobName + '/doDelete'
    });
    if (err) res.status(500).json(err);
    res.json(200);
  });
};

// Show last build info
exports.jenkins_job_buildinfo = function (req, res) {
};

// Build Job
exports.jenkins_job_build = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    request.post({
      url: doc.url + '/job/' + req.params.jobName + '/build'
    });
    if (err) res.status(500).json(err);
    res.json(200);
  });
};

// Build Job with parameters
exports.jenkins_job_buildwithparams = function (req, res) {
};

// Copy Job
exports.jenkins_job_copy = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    request.post({
      url: doc.url + '/createItem/',
      form: {
        name: req.body.newJobName,
        mode: 'copy',
        from: req.params.jobName
      }
    });
    if (err) res.status(500).json(err);
    res.json(200);
  });
};

// Enable Job
exports.jenkins_job_enable = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    request.post({
      url: doc.url + '/job/' + req.params.jobName + '/enable'
    });

    if (err) res.status(500).json(err);
    res.json(200);
  });
};

// Disable Job
exports.jenkins_job_disable = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    request.post({
      url: doc.url + '/job/' + req.params.jobName + '/disable'
    });

    if (err) res.status(500).json(err);
    res.json(200);
  });
};

// Show Job config
exports.jenkins_job_xmlconfig_display = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    request.get({
      url: doc.url + '/job/' + req.params.jobName + '/config.xml'
    }, function (error, response, body) {
      if (err) res.status(500).json(err);
      res.status(200).json(body);
    });
  });
};

// Update Job config
exports.jenkins_job_xmlconfig_update = function (req, res) {
};

exports.jenkins_test_ssh_connection = function (req, res) {
  var conn = new Connection();
  conn.on('ready', function () {
    console.log('Connection :: ready');
  }).connect({
    host: req.body["ssh_ip"],
    port: req.body["ssh_port"],
    username: req.body["username"],
    password: req.body["password"]
  });
  res.status(200).json("");
};

exports.jenkins_migrate = function (req, res) {
  var conn = new Connection();
  conn.on('ready', function () {
    console.log('Connection :: ready');
    conn.shell(function (err, stream) {
      if (err) throw err;
      stream.on('close', function () {
        console.log('Stream :: close');
        conn.end();
      }).on('data', function (data) {
        console.log('STDOUT: ' + data);
      }).stderr.on('data', function (data) {
          console.log('STDERR: ' + data);
        });
      stream.end(
        'service jenkins stop\n' +
        'cd /var/lib/jenkins/\n' +
        'ls -l\n' +
        'find jobs -name config.xml > config.totar\n' +
        'tar zcf /tmp/jenkins_config.tar.gz *.xml userContent/ plugins/ -T config.totar\n' +
        'sshpass -p "' + req.body["toPassword"] + '" scp /tmp/jenkins_config.tar.gz ' + req.body["toUsername"] + '@' + req.body["toSSHIP"] + ':/tmp/\n' +
        'service jenkins start\n' +
        'sshpass -p "' + req.body["toPassword"] + '" ssh ' + req.body["toUsername"] + '@' + req.body["toSSHIP"] + ' \n' +
        'service jenkins stop\n' +
        'cd /var/lib/jenkins\n' +
        'tar xvzf /tmp/jenkins_config.tar.gz\n' +
        'chown -R jenkins:jenkins .\n' +
        'service jenkins restart\n' +
        'exit'
      );
    });
  }).connect({
    host: req.body["fromSSHIP"],
    port: req.body["fromSSHPort"],
    username: req.body["fromUsername"],
    password: req.body["fromPassword"]
  });

  res.json("");

};

//Soft restart Jenkins
exports.jenkins_softRestart = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    request.post({
      url: doc.url + '/safeRestart'
    }, function (error) {
      if (error) res.status(500).json(err);
      res.json(200);
    });
  });
};

//Hard restart Jenkins
exports.jenkins_hardRestart = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    request.post({
      url: doc.url + '/restart'
    }, function (error) {
      if (error) res.status(500).json(err);
      res.json(200);
    });
  });
};

//Shutdown jenkins
exports.jenkins_shutdown = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    request.post({
      url: doc.url + '/safe-shutdown'
    }, function (error) {
      if (error) res.status(500).json(err);
      res.json(200);
    });
  });
};

exports.copy_job_betwen_jenkinses = function (req, res) {
  //noinspection JSUnresolvedFunction
  Jenkins.findById(req.params.id, function (err, doc) {
    request.get({
        url: doc.url + '/job/' + req.params.jobName + '/config.xml'
      }, function (error, response, body) {
        request(
          {
            method: 'POST',
            url: req.body.url + '/createItem?name=' + req.params.newJobName,
            body: body,
            headers: {"content-type": "application/xml"}
          });
        res.json("");
      }
    );
  });
};


exports.jenkins_job_schedule = function (req, res) {
  var schedulerJob = new Scheduler();
  schedulerJob.title = req.body['title'];
  schedulerJob.date = req.body['date'];
  schedulerJob.done = false;
  schedulerJob.pipeline = JSON.parse(req.body['pipeline']);
  schedulerJob.save();

  app.runScheduler(schedulerJob._id);

  res.json(200);
};

exports.jenkins_job_schedule_add = function (req, res) {
  var data = (req.body);

  var schedulerJob = new Scheduler();
  schedulerJob.title = data["title"];
  schedulerJob.date = data['date'];
  schedulerJob.done = false;
  schedulerJob.scheduled = false;
  schedulerJob.saved = true;
  schedulerJob.pipeline = data['pipeline'];
  schedulerJob.save();

  console.log(schedulerJob);

  res.json(200);
};

exports.schedule_list = function (req, res) {
  Scheduler.find({}, function (err, things) {
    if (err) res.status(500).json(err);
    res.status(200).json(things);
  });
};

exports.jenkins_job_schedule_build = function (req, res) {
  console.log(req.body);
  var data = req.body.pipeline;

  for (var i = 0; i < data.length; i++) {
    var jenkinsID = data[i].jenkinsName;
    var jobName = data[i].jobName;
    Jenkins.findById(jenkinsID, function (err, doc) {
      request.post({
        url: doc.url + '/job/' + jobName + '/build'
      });
      if (err) res.json(500, err);
      res.json(200);
    });
  }

  console.log(data);
  res.json(200);
};


