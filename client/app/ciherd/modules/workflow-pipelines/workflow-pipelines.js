'use strict';

angular.module('ciherd')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/modules/workflow-pipelines', {
        templateUrl: 'app/ciherd/modules/workflow-pipelines/workflow-pipelines.html',
        controller: 'WorkflowPipelinesCtrl',
        authenticate: true
      });
  });
