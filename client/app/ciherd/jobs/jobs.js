'use strict';

angular.module('ciherd')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/jenkinses/jobs', {
        templateUrl: 'app/ciherd/jobs/jobs.html',
        controller: 'JobsCtrl',
        authenticate: true
      });
  });
