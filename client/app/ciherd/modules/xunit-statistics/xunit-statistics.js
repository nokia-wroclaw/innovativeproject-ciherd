'use strict';

angular.module('ciherd')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/modules/xunit-statistics', {
        templateUrl: 'app/ciherd/modules/xunit-statistics/xunit-statistics.html',
        controller: 'XunitStatisticsCtrl'
      });
  });
