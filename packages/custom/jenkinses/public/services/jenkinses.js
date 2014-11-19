'use strict';

//Jenkinses service used for jenkinses REST endpoint
angular.module('mean.jenkinses').factory('Jenkinses', ['$resource',
    function ($resource) {
        return $resource('jenkinses/:jenkinsId', {
            jenkinsId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
