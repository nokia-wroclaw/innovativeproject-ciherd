'use strict';

angular.module('ciherd')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }];

    $scope.isCollapsed = true;
    $scope.dd1 = false;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function () {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function (route) {
      return route === $location.path();
    };

    $scope.isActiveSubroute = function (route) {
      console.log(route);
      console.log($location.path());
      console.log($location.path().indexOf(route) !== -1);
      return $location.path().indexOf(route) !== -1;
    };
  });
