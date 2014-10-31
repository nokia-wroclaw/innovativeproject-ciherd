'use strict';

angular.module('mean.jenkinses').controller('JenkinsesController', ['$scope', '$stateParams', '$location', 'Global', 'Jenkinses',
  function($scope, $stateParams, $location, Global, Jenkinses) {
    $scope.global = Global;


    $scope.create = function(isValid) {
      if (isValid) {
        var jenkins = new Jenkinses({
          name: this.name,
          url: this.url,
          token: this.token
        });
        jenkins.$save(function(response) {
          $location.path('jenkinses/' + response._id);
        });

        this.name = '';
        this.url = '';
        this.token = '';
      } else {
        $scope.submitted = true;
      }
    };

    $scope.remove = function(jenkins) {
      if (jenkins) {
        jenkins.$remove();

        for (var i in $scope.jenkinses) {
          if ($scope.jenkinses[i] === jenkins) {
            $scope.jenkinses.splice(i, 1);
          }
        }
      } else {
        $scope.jenkins.$remove(function(response) {
          $location.path('jenkinses');
        });
      }
    };

    $scope.update = function(isValid) {
      if (isValid) {
        var jenkins = $scope.jenkins;
        if (!jenkins.updated) {
          jenkins.updated = [];
        }
        jenkins.updated.push(new Date().getTime());

        jenkins.$update(function() {
          $location.path('jenkinses/' + jenkins._id);
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.find = function() {
      Jenkinses.query(function(jenkinses) {
        $scope.jenkinses = jenkinses;
      });
    };

    $scope.findOne = function() {
      Jenkinses.get({
        jenkinsId: $stateParams.jenkinsId
      }, function(jenkins) {
        $scope.jenkins = jenkins;
      });
    };
  }
]);
