'use strict';

angular.module('ciherd')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/ciherd', {
        templateUrl: 'app/ciherd/ciherd.html',
        controller: 'CiherdCtrl'
      })
      .when('/jenkinses', {
        templateUrl: 'app/ciherd/jenkinses/jenkinses.html',
        controller: 'JenkinsesCtrl'
      })
      .when('/jobs', {
        templateUrl: 'app/ciherd/jobs/jobs.html',
        controller: 'JobsCtrl'
      })
      .when('/jenkinses/jobs/copy/', {
        templateUrl: 'app/ciherd/jobs/copyJobs.html',
        controller: 'JobsCtrl'
      })
      .when('/jenkinses/:id/jobs/:jobName/config.xml', {
        templateUrl: 'app/ciherd/jobs/xml.html',
        controller: 'xmlCtrl'
      });

  });
