'use strict';

angular.module('ciherd')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/modules/migrate', {
        templateUrl: 'app/ciherd/modules/migrate/migrate.html',
        controller: 'MigrateCtrl',
        authenticate: true
      });
  });
