'use strict';

angular.module('ciherd')
  .controller('JenkinsesCtrl',
  function ($scope, ngTableParams, $http, socket, $modal, $location, $window) {
    $scope.checkboxes = {'checked': false, items: {}, 'number': 0};
    $scope.jenkinses = undefined;

    // Initialize list of jenkinses
    $scope.init = function () {
      socket.socket.emit('get::jenkins');
    };

    // On message, save jenkinses to scope
    socket.socket.on('send::jenkinses', function (data) {
      $scope.jenkinses = data;
    });

    socket.socket.on('disconnect', function () {
      console.log('Socket disconnected.');
      socket.socket.socket.reconnect();
    });

    $scope.$on('$routeChangeStart', function () {
      socket.socket.removeAllListeners('send::jenkinses');
    });

    $scope.$watch('jenkins.connection_status', function () {
      console.log('Was changed.');
    });


    // Check all items in table
    $scope.$watch('checkboxes.checked', function (value) {
      angular.forEach($scope.jenkinses, function (item) {
        if (angular.isDefined(item._id)) {
          $scope.checkboxes.items[item._id] = value;
        }
      });
    });

    // React when one of checkboxes was clicked
    $scope.$watch('checkboxes.items', function () {
      if (!$scope.jenkinses) {
        return;
      }
      var checked = 0;
      var unchecked = 0;
      var total = $scope.jenkinses.length;

      angular.forEach($scope.jenkinses, function (item) {
        checked += ($scope.checkboxes.items[item._id]) || 0;
        unchecked += (!$scope.checkboxes.items[item._id]) || 0;
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
      total: 0,
      getData: function () {

      }
    });

    // Remove jenkins button
    $scope.removeJenkins = function (jenkins) {
      $scope.jenkins = jenkins;
      $modal.open({
        templateUrl: 'app/ciherd/jenkinses/modals/removeJenkins.html',
        controller: 'JenkinsesActionModalCtrl',
        resolve: {
          jenkins: getJenkins()
        }
      });


    };

    // Shutdown jenkins button
    $scope.shutdownJenkins = function (jenkins) {
      $scope.jenkins = jenkins;
      $modal.open({
        templateUrl: 'app/ciherd/jenkinses/modals/shutdownJenkins.html',
        controller: 'JenkinsesActionModalCtrl',
        resolve: {
          jenkins: getJenkins()
        }
      });
    };

    //Soft restart Jenkins
    $scope.softRestart = function (jenkins) {
      $scope.jenkins = jenkins;
      $modal.open({
        scope: $scope,
        templateUrl: 'app/ciherd/jenkinses/modals/softRestartJenkins.html',
        controller: 'JenkinsesActionModalCtrl',
        resolve: {
          jenkins: getJenkins()
        }
      });
    };


    function getJenkins() {
      return function () {
        return $scope.jenkins;
      };
    }



    //Hard restart Jenkins
    $scope.hardRestart = function (jenkins) {
      $scope.jenkins = jenkins;
      $modal.open({
        templateUrl: 'app/ciherd/jenkinses/modals/hardRestartJenkins.html',
        controller: 'JenkinsesActionModalCtrl',
        resolve: {
          jenkins: getJenkins()
        }
      });

    };

    // Open 'Add new jenkins' modal
    $scope.open = function () {
      $scope.jenkins = '';
      $modal.open({
        templateUrl: 'app/ciherd/jenkinses/modals/addJenkins.html',
        controller: 'JenkinsesActionModalCtrl',
        resolve: {
          jenkins: getJenkins()
        }
      });
    };

    // Open 'Edit jenkins' modal
    $scope.editJenkins = function (jenkins) {
      $scope.jenkins = jenkins;
      $modal.open({
        templateUrl: 'app/ciherd/jenkinses/modals/editJenkins.html',
        controller: 'JenkinsesActionModalCtrl',
        resolve: {
          jenkins: getJenkins()
        }
      });
    };

    // Open 'View jenkins' modal
    $scope.viewJenkins = function (jenkins) {
      $scope.jenkins = jenkins;
      $modal.open({
        templateUrl: 'app/ciherd/jenkinses/modals/viewJenkins.html',
        controller: 'JenkinsesActionModalCtrl',
        resolve: {
          jenkins: getJenkins()
        }
      });
    };

    // Opens List of Jobs in expanded selected jenkins.
    $scope.goToJobs = function (jenkins) {
      $window.location.href = 'jenkinses/jobs#' + jenkins._id;
    };

    // Batch action with expand selected jobs in List of Jobs.
    $scope.massGoToJobs = function () {
      var jenkinsesIDs = [];
      for (var item in $scope.checkboxes.items) {
        if ($scope.checkboxes.items[item]) {
          jenkinsesIDs.push(item);
        }
      }
      jenkinsesIDs = jenkinsesIDs.join(',');

      $window.location.href = 'jenkinses/jobs#' + jenkinsesIDs;
    };

    // Opens Jenkins plugin manager in new tab.
    $scope.goToPlugins = function (jenkins) {
      $window.location.href = 'jenkinses/plugins#' + jenkins._id;
    };

    $scope.massGoToPlugins = function () {
      var jenkinsesIDs = [];
      for (var item in $scope.checkboxes.items) {
        if ($scope.checkboxes.items[item]) {
          jenkinsesIDs.push(item);
        }
      }
      jenkinsesIDs = jenkinsesIDs.join(',');

      $window.location.href = 'jenkinses/plugins#' + jenkinsesIDs;
    };

    // Open 'Mass Restart' modal
    $scope.massRestartJenkins = function () {
      $scope.checkedJenkinses = [];
      for (var item in $scope.checkboxes.items) {
        if ($scope.checkboxes.items[item]) {
          for (var i = 0; i < $scope.jenkinses.length; i++) {
            if ($scope.jenkinses[i]._id === item) {
              $scope.checkedJenkinses.push({id: item, desc: $scope.jenkinses[i].description});
            }
          }
        }
      }

      $modal.open({
        templateUrl: 'app/ciherd/jenkinses/modals/restartMassJenkins.html',
        controller: 'MassJenkinsesActionModalCtrl',
        resolve: {
          checkedJenkinses: function () {
            return $scope.checkedJenkinses;
          }
        }
      });
    };

    // Open 'Mass Shutdown' modal
    $scope.massShutdownJenkins = function () {
      $scope.checkedJenkinses = [];
      for (var item in $scope.checkboxes.items) {
        if ($scope.checkboxes.items[item]) {
          for (var i = 0; i < $scope.jenkinses.length; i++) {
            if ($scope.jenkinses[i]._id === item) {
              $scope.checkedJenkinses.push({id: item, desc: $scope.jenkinses[i].description});
            }
          }
        }
      }

      $modal.open({
        templateUrl: 'app/ciherd/jenkinses/modals/shutdownMassJenkins.html',
        controller: 'MassJenkinsesActionModalCtrl',
        resolve: {
          checkedJenkinses: function () {
            return $scope.checkedJenkinses;
          }
        }
      });
    };

    // Open 'Mass Remove' modal
    $scope.massRemoveJenkins = function () {
      $scope.checkedJenkinses = [];
      for (var item in $scope.checkboxes.items) {
        if ($scope.checkboxes.items[item]) {
          for (var i = 0; i < $scope.jenkinses.length; i++) {
            if ($scope.jenkinses[i]._id === item) {
              $scope.checkedJenkinses.push({id: item, desc: $scope.jenkinses[i].description});
            }
          }
        }
      }

      $modal.open({
        templateUrl: 'app/ciherd/jenkinses/modals/removeMassJenkins.html',
        controller: 'MassJenkinsesActionModalCtrl',
        resolve: {
          checkedJenkinses: function () {
            return $scope.checkedJenkinses;
          }
        }
      });
    };

  }).controller('JenkinsesActionModalCtrl', function ($scope, $http, $modalInstance, jenkins, socket, growl) {
    console.log(jenkins);
    $scope.jenkins = jenkins;

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.save = function () {
      $modalInstance.close();

      $scope.data = {
        'desc': $scope.desc,
        'url': $scope.url,
        'UserId': $scope.UserID,
        'APIToken': $scope.APIToken,
        'SSHUsername': $scope.SSHUsername,
        'SSHPassword': $scope.SSHPassword,
        'SSHPort': $scope.SSHPort
      };
      var jenkinsValid = function () {
        return true;
      };

      if (jenkinsValid()) {
        $modalInstance.close();
        $http.post('api/jenkinses/', $scope.data).
          success(function () {
            socket.socket.emit('get::jenkins');
          });
      }
    };

    $scope.editJenkins = function () {
      $scope.jenkinsID = jenkins._id;
      $modalInstance.close();
      $scope.data = {
        'description': jenkins.description,
        'url': jenkins.url,
        'UserId': jenkins.UserID,
        'APIToken': jenkins.APIToken,
        'SSHUsername': $scope.SSHUsername,
        'SSHPassword': $scope.SSHPassword,
        'SSHPort': $scope.SSHPort
      };
      $http.put('api/jenkinses/' + $scope.jenkinsID, $scope.data).
        success(function () {
          growl.success('Jenkins successfully edited');
          socket.socket.emit('get::jenkins');
        });
    };

    $scope.deleteJenkins = function () {
      $modalInstance.close();
      $http.delete('api/jenkinses/' + jenkins._id).
        success(function () {
          growl.success('Jenkins successfully deleted');
          socket.socket.emit('get::jenkins');
        });
    };

    $scope.shutdownJenkins = function () {
      $scope.jenkinsID = jenkins._id;
      $modalInstance.close();
      $http.post('/api/jenkinses/' + jenkins._id + '/shutdown').
        success(function () {
          growl.info('Jenkins is going to shutdown');
          socket.socket.emit('get::jenkins');
        });
    };

    $scope.softRestartJenkins = function () {
      $modalInstance.close();
      $http.post('/api/jenkinses/' + jenkins._id + '/soft-restart', {timeout: 1000}).
        success(function () {
          growl.info('Jenkins is going to restart');
          socket.socket.emit('get::jenkins');
        });
    };

    $scope.hardRestartJenkins = function () {
      $modalInstance.close();
      $http.post('/api/jenkinses/' + jenkins._id + '/hard-restart', {timeout: 1000}).
        success(function () {
          growl.info('Jenkins is going to restart');
          socket.socket.emit('get::jenkins');
        });
    };

  }).
  controller('MassJenkinsesActionModalCtrl', function ($scope, $http, $modalInstance, checkedJenkinses, socket, growl) {
    $scope.checkedJenkinses = checkedJenkinses;

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    function getJenkinses() {
      socket.socket.emit('get::jenkins');
    }

    $scope.restartMassJenkins = function () {
      $modalInstance.close();
      for (var i = 0; i < $scope.checkedJenkinses.length; i++) {
        $http.post('/api/jenkinses/' + $scope.checkedJenkinses[i].id + '/soft-restart', {timeout: 1000}).
          success(getJenkinses());
      }
      growl.info('Jenkinses are going to restart');
    };

    $scope.shutdownMassJenkins = function () {
      $modalInstance.close();
      for (var i = 0; i < $scope.checkedJenkinses.length; i++) {
        $http.delete('/api/jenkinses/' + $scope.checkedJenkinses[i].id + '/shutdown', {timeout: 1000}).
          success(getJenkinses());
      }
      growl.info('Jenkinses are going to shutdown');
    };

    $scope.removeMassJenkins = function () {
      $modalInstance.close();
      for (var i = 0; i < $scope.checkedJenkinses.length; i++) {
        $http.delete('/api/jenkinses/' + $scope.checkedJenkinses[i].id, {timeout: 1000}).
          success(getJenkinses());
      }
      growl.success('Jenkins successfully deleted');
    };
  });
