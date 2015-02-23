'use strict';

angular.module('ciherd')
  .controller('WorkflowPipelinesCtrl', function ($scope, $modal, $http) {
    $scope.init = function () {
      $http.get('http://127.0.0.1:9000/api/jenkinses/schedule/get').
        success(function (data) {
          console.log(data);
          $scope.pipelines = data;
        });
    };
    $scope.dragoverCallback = function (event, index, external, type) {
      $scope.logListEvent('dragged over', event, index, external, type);
      return index > 0;
    };

    $scope.dropCallback = function (event, index, item, external, type, allowedType) {
      $scope.logListEvent('dropped at', event, index, external, type);
      if (external) {
        console.log(item);
        if (allowedType === 'itemType' && !item.label) {
          return false;
        }
        if (allowedType === 'containerType' && !angular.isArray(item)) {
          return false;
        }
      }
      return item;
    };

    $scope.logEvent = function (message, event) {
      console.log(message, '(triggered by the following', event.type, 'event)');
      console.log(event);
    };

    $scope.logListEvent = function (action, event, index, external, type) {
      var message = external ? 'External ' : '';
      message += type + ' element is ' + action + ' position ' + index;
      $scope.logEvent(message, event);
    };

    $scope.jobs = [];
    $scope.pipelines = [];


    $scope.addJob = function () {
      $modal.open({
        templateUrl: 'addWorkflowPipelineJob.html',
        controller: 'AddWorkflowPipelineJobCtrl',
        resolve: {
          jobs: function () {
            return $scope.jobs;
          },
          pipelines: function () {
            return $scope.pipelines;
          }
        }
      });
    };

    $scope.addJobOnPipeline = function (pipeline) {
      $modal.open({
        templateUrl: 'addWorkflowPipelineJob.html',
        controller: 'AddWorkflowPipelineJobCtrl',
        resolve: {
          jobs: function () {
            return $scope.jobs;
          },
          pipelines: function () {
            return pipeline;
          }
        }
      });
    };

    $scope.editJob = function (job) {
      $modal.open({
        templateUrl: 'editWorkflowPipelineJob.html',
        controller: 'AddWorkflowPipelineJobCtrl',
        resolve: {
          jobs: function () {
            return job;
          },
          pipelines: function () {
            return $scope.pipelines;
          }
        }
      });
    };

    $scope.addWorkflowPipeline = function () {
      $modal.open({
        templateUrl: 'addWorkflowPipeline.html',
        controller: 'AddWorkflowPipelineJobCtrl',
        resolve: {
          jobs: function () {
            return $scope.jobs;
          },
          pipelines: function () {
            return $scope.pipelines;
          }
        }
      });
    };

    $scope.savePipeline = function (pipeline) {
      var temp = pipeline;
      console.log(pipeline);
      $http.post('http://127.0.0.1:9000/api/jenkinses/schedule/add', temp).
        success(function (data) {
          console.log(data);
        });
      pipeline.saved = true;
    };

    $scope.runScheduler = function (pipeline) {
      var temp = pipeline;
      console.log(pipeline);
      $http.post('http://127.0.0.1:9000/api/jenkinses/schedule/build', temp).
        success(function (data) {
          console.log(data);
        });
      pipeline.scheduled = true;
    };


  }).controller('AddWorkflowPipelineJobCtrl', function ($scope, $modalInstance, socket, jobs, pipelines) {
    $scope.jenkinses = undefined;
    $scope.jobs = jobs;
    $scope.pipelines = pipelines;


    // Initialize list of jenkinses
    $scope.init = function () {
      socket.socket.emit('get::jenkins');
    };

    // On message, save jenkinses to scope
    socket.socket.on('send::jenkinses', function (data) {
      $scope.jenkinses = data;
    });

    $scope.$on('$routeChangeStart', function () {
      socket.socket.removeAllListeners('send::jenkinses');
    });

    $scope.addJob = function () {
      /*      for (var i = 0; i < $scope.jenkinses.length; i++) {
       if ($scope)
       console.log($scope.jenkinses[i].description);
       }*/
      console.log($scope.pipelines);
      $modalInstance.close();
      $scope.pipelines.pipeline.push({
        label: $scope.label,
        jenkinsName: $scope.jenkinsName._id,
        jobName: $scope.jobName.name,
        buildParameters: $scope.buildParameters,
        status: 0
      });
    };

    $scope.addJobOnPipeline = function () {
      $modalInstance.close();
      $scope.jobs.push({
        label: $scope.label,
        jenkinsName: $scope.jenkinsName.description,
        jobName: $scope.jobName.name,
        buildParameters: $scope.buildParameters
      });
    };

    $scope.addPipelines = function () {
      $modalInstance.close();
      $scope.pipelines.push({
        title: $scope.workflowTitle,
        date: $scope.workflowCronDate,
        pipeline: [],
        done: false,
        scheduled: false,
        saved: false
      });
    };


    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
