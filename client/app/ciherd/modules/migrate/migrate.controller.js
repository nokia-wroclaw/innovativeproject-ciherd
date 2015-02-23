'use strict';

angular.module('ciherd')
  .controller('MigrateCtrl', function ($scope, socket, $http, $location) {
    $scope.init = function () {
      socket.socket.emit('get::jenkins');
    };
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
    $scope.from = [];
    $scope.migrateJenkins = function () {
      $scope.data = {
        fromSSHIP: $scope.fromJenkins.url.split('http://')[1].split(':')[0],
        fromSSHPort: $scope.fromJenkins.SSHPort,
        fromUsername: $scope.fromJenkins.SSHUsername,
        fromPassword: $scope.fromJenkins.SSHPassword,
        toSSHIP: $scope.toJenkins.url.split('http://')[1].split(':')[0],
        toSSHPort: $scope.toJenkins.SSHPort,
        toUsername: $scope.toJenkins.SSHUsername,
        toPassword: $scope.toJenkins.SSHPassword
      };
      $http.post('/api/jenkinses/migrate', $scope.data).
        success(function () {
          $location.path('/jenkinses/');
          // this callback will be called asynchronously
          // when the response is available
        }).
        error(function () {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    };
  });
