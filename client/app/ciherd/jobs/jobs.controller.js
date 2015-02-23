'use strict';

angular.module('ciherd')
  .controller('JobsCtrl', function ($timeout, $scope, ngTableParams, $http, socket, $modal, $filter, $location, growl) {
    // Initialize list of jenkinses
    $scope.init = function () {
      socket.socket.emit('get::jenkins');

    };
    $scope.hideRows = undefined;

    // On message, save jenkinses to scope
    socket.socket.on('send::jenkinses', function (data) {
      $scope.jenkinses = data;
      if ($scope.hideRows === undefined) {
        $scope.hideRows = [];
        for (var i = 0; i < $scope.jenkinses.length; i++) {
          if ($location.hash().split(',').indexOf($scope.jenkinses[i]._id) > -1) {
            //if ($location.hash() === $scope.jenkinses[i]._id) {
            $scope.hideRows[$scope.jenkinses[i]._id] = false;
          } else {
            $scope.hideRows[$scope.jenkinses[i]._id] = true;
          }
        }
      }
    });

    $scope.$on('$routeChangeStart', function () {
      socket.socket.removeAllListeners('send::jenkinses');
    });

    socket.socket.on('disconnect', function () {
      console.log('Socket disconnected.');
      socket.socket.socket.reconnect();
    });

    $scope.jenkinses = undefined;
    $scope.checkboxes = {'checked': false, items: {}, jenkins: {}, 'number': 0};
    $scope.xml = undefined;

    // Check all items in table
    $scope.$watch('checkboxes.checked', function (value) {
      angular.forEach($scope.jenkinses, function (jenkins) {
        angular.forEach(jenkins.jobs, function (job) {
          if (angular.isDefined(job._id)) {
            $scope.checkboxes.items[job._id] = value;
          }
        });
      });
    });

    // watch for data checkboxes
    $scope.$watch('checkboxes.items', function () {
      if (!$scope.jenkinses) {
        return;
      }
      var checked = 0;
      var unchecked = 0;
      var total = 0;

      for (var i = 0; i < $scope.jenkinses.length; i++) {
        total += $scope.jenkinses[i].jobs.length;
      }

      angular.forEach($scope.jenkinses, function (jenkins) {
        angular.forEach(jenkins.jobs, function (job) {
          checked += ($scope.checkboxes.items[job._id]) || 0;
          unchecked += (!$scope.checkboxes.items[job._id]) || 0;
        });
      });
      $scope.checkboxes.number = checked;

      if ((unchecked === 0) || (checked === 0)) {
        $scope.checkboxes.checked = (checked === total);
      }

      angular.element(document.getElementById('select_all')).prop('indeterminate', (checked !== 0 && unchecked !== 0));
    }, true);

    // NG-Table configuration
    /*jshint -W055 */
    $scope.tableParams = new ngTableParams({
      page: 1,
      count: 10
    }, {
      total: 10,
      getData: function () {
      }
    });

    $scope.copyJob = function (jenkins, job) {
      $scope.jenkins = jenkins;
      $scope.job = job;

      var modalInstance = $modal.open({
        templateUrl: 'app/ciherd/jobs/modals/copyJob.html',
        controller: 'ModalJobsCtrl',
        resolve: {
          jenkins: function () {
            return $scope.jenkins;
          },
          job: function () {
            return $scope.job;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
      });
    };

    $scope.models = {
      selected: null,
      lists: {'Jenkinses': [], 'naJenkinsa': []},
      test: {'Jobs': [], 'toCopy': []}
    };

    $scope.initCopy = function () {
      socket.socket.emit('get::jenkins');

      $timeout(function() {
        for (var i = 0; i < $scope.jenkinses.length; i++) {
          $scope.models.lists.Jenkinses.push({jenkinses: $scope.jenkinses[i]});
          for (var j = 0; j < $scope.jenkinses[i].jobs.length; j++) {
            $scope.models.test.Jobs.push({jobs: $scope.jenkinses[i].jobs[j]});
          }
        }
      }, 500);
    };

    function getJenkinsRedirect() {
      return function () {
        socket.socket.emit('get::jenkins');
        $location.path('/jenkinses/jobs');
      };
    }

    $scope.massCopyJob = function () {
      for (var k = 0; k < $scope.models.test.toCopy.length; k++) {
        for (var m = 0; m < $scope.models.lists.naJenkinsa.length; m++) {
          for (var i = 0; i < $scope.jenkinses.length; i++) {
            for (var j = 0; j < $scope.jenkinses[i].jobs.length; j++) {
              if ($scope.jenkinses[i].jobs[j]._id === $scope.models.test.toCopy[k].jobs._id) {
                $http.post('/api/jenkinses/' + $scope.jenkinses[i]._id + '/jobs/' + $scope.jenkinses[i].jobs[j].name + '/copy/' + $scope.jenkinses[i].jobs[j].name, $scope.models.lists.naJenkinsa[m].jenkinses).
                  success(getJenkinsRedirect());
              }
            }
          }
        }
      }
    };

    $scope.viewJob = function (jenkins, job) {
      $scope.jenkins = jenkins;
      $scope.job = job;
      $modal.open({
        templateUrl: 'app/ciherd/jobs/modals/viewJob.html',
        controller: 'ModalJobsCtrl',
        resolve: {
          jenkins: function () {
            return $scope.jenkins;
          },
          job: function () {
            return $scope.job;
          }
        }
      });
    };

    $scope.deleteJob = function (jenkins, job) {
      $scope.jenkins = jenkins;
      $scope.job = job;
      $modal.open({
        templateUrl: 'app/ciherd/jobs/modals/removeJob.html',
        controller: 'ModalJobsCtrl',
        resolve: {
          jenkins: function () {
            return $scope.jenkins;
          },
          job: function () {
            return $scope.job;
          }
        }
      });
    };

    $scope.buildJob = function (jenkins, job) {
      $http.put('/api/jenkinses/' + jenkins._id + '/jobs/' + job.name + '/build').
        success(function () {
          growl.success('Job successfully builded');
          socket.socket.emit('get::jenkins');
        });
    };

    $scope.disableJob = function (jenkins, job) {
      $http.put('/api/jenkinses/' + jenkins._id + '/jobs/' + job.name + '/disable').
        success(function () {
          growl.success('Job successfully disabled');
          socket.socket.emit('get::jenkins');
        });
    };

    $scope.redirect = function (jenkins, job) {
      window.location = '/jenkinses/' + jenkins._id + '/jobs/' + job.name + '/config.xml';
    };

    $scope.enableJob = function (jenkins, job) {
      $http.put('/api/jenkinses/' + jenkins._id + '/jobs/' + job.name + '/enable').
        success(function () {
          growl.success('Job successfully enabled');
          socket.socket.emit('get::jenkins');
        });
    };


    $scope.massEnableJob = function () {
      $scope.checkedJobs = [];
      for (var jobID in $scope.checkboxes.items) {
        //noinspection JSUnfilteredForInLoop
        if (!$scope.checkboxes.items[jobID]) {
          continue;
        }
        for (var i = 0; i < $scope.jenkinses.length; i++) {
          for (var j = 0; j < $scope.jenkinses[i].jobs.length; j++) {
            if ($scope.jenkinses[i].jobs[j]._id === jobID) {
              $scope.checkedJobs.push({id: $scope.jenkinses[i]._id, jobName: $scope.jenkinses[i].jobs[j].name});
            }
          }
        }
      }

      $modal.open({
        templateUrl: 'app/ciherd/jobs/modals/enableMassJobs.html',
        controller: 'MassJobsActionModalCtrl',
        resolve: {
          checkedJobs: function () {
            return $scope.checkedJobs;
          }
        }
      });

    };

    $scope.massDisableJob = function () {
      /*$http.put('/api/jenkinses/' + $scope.jenkinses[i]._id + '/jobs/' + $scope.jenkinses[i].jobs[j].name + '/disable', {timeout: 1000}).
       success(function () {
       socket.socket.emit('get::jenkins');
       });*/
      $scope.checkedJobs = [];
      for (var jobID in $scope.checkboxes.items) {
        //noinspection JSUnfilteredForInLoop
        if (!$scope.checkboxes.items[jobID]) {
          continue;
        }
        for (var i = 0; i < $scope.jenkinses.length; i++) {
          for (var j = 0; j < $scope.jenkinses[i].jobs.length; j++) {
            if ($scope.jenkinses[i].jobs[j]._id === jobID) {
              $scope.checkedJobs.push({id: $scope.jenkinses[i]._id, jobName: $scope.jenkinses[i].jobs[j].name});
            }
          }
        }
      }
      $modal.open({
        templateUrl: 'app/ciherd/jobs/modals/disableMassJobs.html',
        controller: 'MassJobsActionModalCtrl',
        resolve: {
          checkedJobs: function () {
            return $scope.checkedJobs;
          }
        }
      });
    };

    $scope.massDeleteJob = function () {
      $scope.checkedJobs = [];
      for (var jobID in $scope.checkboxes.items) {
        //noinspection JSUnfilteredForInLoop
        if (!$scope.checkboxes.items[jobID]) {
          continue;
        }
        for (var i = 0; i < $scope.jenkinses.length; i++) {
          for (var j = 0; j < $scope.jenkinses[i].jobs.length; j++) {
            if ($scope.jenkinses[i].jobs[j]._id === jobID) {
              $scope.checkedJobs.push({id: $scope.jenkinses[i]._id, jobName: $scope.jenkinses[i].jobs[j].name});
            }
          }
        }
      }

      $modal.open({
        templateUrl: 'app/ciherd/jobs/modals/deleteMassJobs.html',
        controller: 'MassJobsActionModalCtrl',
        resolve: {
          checkedJobs: function () {
            return $scope.checkedJobs;
          }
        }
      });
    };


    $scope.massBuildJob = function () {
      $scope.checkedJobs = [];
      for (var jobID in $scope.checkboxes.items) {
        //noinspection JSUnfilteredForInLoop
        if (!$scope.checkboxes.items[jobID]) {
          continue;
        }
        for (var i = 0; i < $scope.jenkinses.length; i++) {
          for (var j = 0; j < $scope.jenkinses[i].jobs.length; j++) {
            if ($scope.jenkinses[i].jobs[j]._id === jobID) {
              $scope.checkedJobs.push({id: $scope.jenkinses[i]._id, jobName: $scope.jenkinses[i].jobs[j].name});
            }
          }
        }
      }
      $modal.open({
        templateUrl: 'app/ciherd/jobs/modals/buildMassJobs.html',
        controller: 'MassJobsActionModalCtrl',
        resolve: {
          checkedJobs: function () {
            return $scope.checkedJobs;
          }
        }
      });
    };


  })
  .controller('ModalJobsCtrl', function ($scope, $http, $modalInstance, socket, jenkins, job, growl) {
    $scope.jenkins = jenkins;
    $scope.job = job;

    $scope.copy = function () {
      $scope.jenkinsID = jenkins._id;
      $modalInstance.close();
      $scope.data = {
        'jobName': job.name,
        'newJobName': $scope.newJobName
      };
      $http.post('/api/jenkinses/' + jenkins._id + '/jobs/' + job.name + '/copy', $scope.data).
        success(function () {
          growl.success('Job successfully copied');
          socket.socket.emit('get::jenkins');
        });
    };

    $scope.deleteJob = function () {
      $modalInstance.close();
      $http.delete('/api/jenkinses/' + jenkins._id + '/jobs/' + job.name, {timeout: 1000}).
        success(function () {
          growl.success('Job successfully deleted');
          socket.socket.emit('get::jenkins');
        });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  })
  .controller('xmlCtrl', function ($scope, $http, $routeParams) {
    var url = '/api/jenkinses/' + $routeParams.id + '/jobs/' + $routeParams.jobName + '/xml-config';
    $http.get(url).success(function (data) {
      $scope.xml = data;
    });
  })
  .controller('MassJobsActionModalCtrl', function ($scope, $http, $modalInstance, checkedJobs, socket, growl) {
    $scope.checkedJenkinses = checkedJobs;

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    function getJenkinses() {
      return function () {
        socket.socket.emit('get::jenkins');
      };
    }

    $scope.enableMassJobs = function () {
      $modalInstance.close();

      for (var i = 0; i < $scope.checkedJenkinses.length; i++) {
        $http.put('/api/jenkinses/' + $scope.checkedJenkinses[i].id + '/jobs/' + $scope.checkedJenkinses[i].jobName + '/enable', {timeout: 1000}).
          success(getJenkinses());
      }
      growl.success('Jobs successfully enabled');
    };

    $scope.disableMassJobs = function () {
      $modalInstance.close();

      for (var i = 0; i < $scope.checkedJenkinses.length; i++) {
        $http.put('/api/jenkinses/' + $scope.checkedJenkinses[i].id + '/jobs/' + $scope.checkedJenkinses[i].jobName + '/disable', {timeout: 1000}).
          success(getJenkinses());
      }
      growl.success('Jobs successfully disabled');
    };

    $scope.buildMassJobs = function () {
      $modalInstance.close();

      for (var i = 0; i < $scope.checkedJenkinses.length; i++) {
        $http.put('/api/jenkinses/' + $scope.checkedJenkinses[i].id + '/jobs/' + $scope.checkedJenkinses[i].jobName + '/build', {timeout: 1000}).
          success(getJenkinses());
      }
      //growl.success('Jobs successfully builded');
    };

    $scope.deleteMassJobs = function () {
      $modalInstance.close();

      for (var i = 0; i < $scope.checkedJenkinses.length; i++) {
        $http.delete('/api/jenkinses/' + $scope.checkedJenkinses[i].id + '/jobs/' + $scope.checkedJenkinses[i].jobName, {timeout: 1000}).
          success(getJenkinses());
      }
      growl.success('Jobs successfully deleted');
    };
  });
