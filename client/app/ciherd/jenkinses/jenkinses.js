'use strict';

angular.module('ciherd')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/jenkinses', {
        templateUrl: 'app/ciherd/jenkinses/jenkinses.html',
        controller: 'JenkinsesCtrl',
        authenticate: true
      })
    ;
  });
