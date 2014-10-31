'use strict';

//Setting up route
angular.module('mean.jenkinses').config(['$stateProvider',
  function($stateProvider) {
    // Check if the user is connected
    var checkLoggedin = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Authenticated
        if (user !== '0') $timeout(deferred.resolve);

        // Not Authenticated
        else {
          $timeout(deferred.reject);
          $location.url('/login');
        }
      });

      return deferred.promise;
    };

    // states for my app
    $stateProvider
      .state('all jenkinses', {
        url: '/jenkinses',
        templateUrl: 'jenkinses/views/list.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('create jenkinses', {
        url: '/jenkinses/create',
        templateUrl: 'jenkinses/views/create.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('edit jenkins', {
        url: '/jenkinses/:jenkinsId/edit',
        templateUrl: 'jenkinses/views/edit.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('jenkins by id', {
        url: '/jenkinses/:jenkinsId',
        templateUrl: 'jenkinses/views/view.html',
        resolve: {
          loggedin: checkLoggedin
        }
      });
  }
]);
