'use strict';

angular.module('ciherd')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/modules/update-center', {
        templateUrl: 'app/ciherd/modules/update-center/update-center.html',
        controller: 'UpdateCenterCtrl',
        authenticate: true
      });
  });
