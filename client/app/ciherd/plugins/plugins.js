'use strict';

angular.module('ciherd')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/jenkinses/plugins', {
        templateUrl: 'app/ciherd/plugins/plugins.html',
        controller: 'PluginsCtrl',
        authenticate: true
      });
  });
