'use strict';

angular.module('ciherd')
  .filter('toDate', function () {
    return function (input) {
      if (input === undefined) {
        return 'Not build';
      }

      if (!isNaN(input)) {
        return 'Unknown';
      }

      var data = input.split('_');
      var time = data[1].split('-').join(':');
      return new Date(data[0] + ',' + time).getTime();
    };
  })
  .filter('numberFixedLen', function () {
    return function (a, b) {
      return (1e4 + a + '').slice(-b);
    };
  });
