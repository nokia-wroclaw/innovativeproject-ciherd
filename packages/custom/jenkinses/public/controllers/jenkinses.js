'use strict';

angular.module('mean.jenkinses', ['ngTable']).
    controller('JenkinsesController',
    ['$scope', '$stateParams', '$location', 'Global', 'Jenkinses',
        function ($scope, $stateParams, $location, Global, Jenkinses) {
            $scope.global = Global;

            $scope.create = function (isValid) {
                if (isValid) {
                    var jenkins = new Jenkinses({
                        description: this.description,
                        url: this.url,
                        UserID: this.UserID,
                        APIToken: this.APIToken

                    });
                    //noinspection JSUnresolvedFunction
                    jenkins.$save(function (response) {
                        $location.path('jenkinses/' + response._id);
                    });
                    this.name = '';
                    this.url = '';
                    this.token = '';
                } else {
                    $scope.submitted = true;
                }
            };

            $scope.remove = function (jenkins) {
                if (jenkins) {
                    //noinspection JSUnresolvedFunction
                    jenkins.$remove();
                    $location.path('jenkinses');

                    for (var i in $scope.jenkinses) {
                        //noinspection JSUnfilteredForInLoop
                        if ($scope.jenkinses[i] === jenkins) {
                            //noinspection JSUnfilteredForInLoop
                            $scope.jenkinses.splice(i, 1);
                        }
                    }
                } else {
                    //noinspection JSUnresolvedFunction
                    $scope.jenkins.$remove(function () {
                        $location.path('jenkinses');
                    });
                }
            };

            $scope.update = function (isValid) {
                if (isValid) {
                    var jenkins = $scope.jenkins;
                    if (!jenkins.updated) {
                        jenkins.updated = [];
                    }
                    jenkins.updated.push(new Date().getTime());

                    //noinspection JSUnresolvedFunction
                    jenkins.$update(function () {
                        $location.path('jenkinses/' + jenkins._id);
                    });
                } else {
                    $scope.submitted = true;
                }
            };

            $scope.find = function () {
                Jenkinses.query(function (jenkinses) {
                    $scope.jenkinses = jenkinses;
                });
            };

            $scope.findOne = function () {
                Jenkinses.get({
                    jenkinsId: $stateParams.jenkinsId
                }, function (jenkins) {
                    $scope.jenkins = jenkins;
                });
            };


        }
    ]).
    controller('JenkinsesListController',
    ['$scope', '$filter', '$q', 'ngTableParams', 'Jenkinses', '$http',
        function ($scope, $filter, $q, ngTableParams, Jenkinses, $http) {
            var data = Jenkinses.query(function (jenkinses) {
                $scope.jenkinses = jenkinses;
            });

            /*jshint -W055 */
            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 10           // count per page
            }, {
                total: data.length,  // length of data
                /*
                 getData: function ($defer, params) {
                 console.log((params.page() - 1) * params.count());
                 console.log(params.page() * params.count());

                 $defer.resolve($scope.users = data.slice(
                 (params.page() - 1) * params.count(),
                 params.page() * params.count())
                 );
                 }*/
                getData: function ($defer) {
                    $defer.resolve(data);
                }

            });

            $scope.checkboxes = {'checked': false, items: {}};

            // watch for check all checkbox
            $scope.$watch('checkboxes.checked', function (value) {
                angular.forEach($scope.jenkinses, function (item) {
                    if (angular.isDefined(item._id)) {
                        $scope.checkboxes.items[item._id] = value;
                    }
                });
            });

            // watch for data checkboxes
            $scope.$watch('checkboxes.items', function () {
                if (!$scope.jenkinses) {
                    return;
                }
                var checked = 0, unchecked = 0,
                    total = $scope.jenkinses.length;
                angular.forEach($scope.jenkinses, function (item) {
                    checked += ($scope.checkboxes.items[item._id]) || 0;
                    unchecked += (!$scope.checkboxes.items[item._id]) || 0;
                });
                if ((unchecked === 0) || (checked === 0)) {
                    $scope.checkboxes.checked = (checked === total);
                }
                // grayed checkbox
                angular.element(document.getElementById('select_all')).
                    prop('indeterminate', (checked !== 0 && unchecked !== 0));
            }, true);


            $scope.connectionStatus = function (jenkins) {
                console.log(jenkins._id);
                //$.get("http://127.0.0.1:3000/jenkinses/" + jenkins._id + "/status");
                $http({
                    method: 'GET',
                    url: 'http://127.0.0.1:3000/jenkinses/' + jenkins._id + '/status'
                }).success(function (data, status, headers, config) {
                    console.log(data);
                    jenkins.isOnline = data;
                    // data contains the response
                    // status is the HTTP status
                    // headers is the header getter function
                    // config is the object that was used to create the HTTP request
                }).error(function (data, status, headers, config) {
                });
            };

            $scope.latestBuildStatus = function (jenkins) {

            };
        }]).
    controller('JobListController',
    ['$scope', '$filter', '$q', 'ngTableParams', 'Jenkinses', '$http','$stateParams',
        function ($scope, $filter, $q, ngTableParams, Jenkinses, $http) {
            var data = Jenkinses.query(function (jenkinses) {
                $scope.jenkinses = jenkinses;
            });

            $scope.find = function () {
                Jenkinses.query(function (jenkinses) {
                    $scope.jenkinses = jenkinses;
                });
            };

            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 10           // count per page
            }, {
                total: data.length,  // length of data

                 /*getData: function ($defer, params) {
                 console.log((params.page() - 1) * params.count());
                 console.log(params.page() * params.count());

                 $defer.resolve($scope.users = data.slice(
                 (params.page() - 1) * params.count(),
                 params.page() * params.count())
                 );
                 }*/
                getData: function ($defer) {
                    $defer.resolve(data);
                }

            });

            $scope.jobs = function (jenkins) {
                $http({
                    method: 'GET',
                    url: 'http://127.0.0.1:3000/jenkinses/' + jenkins._id + '/jobs'
                }).success(function (data, status, headers, config) {
                    jenkins.jobs = data;
                }).error(function (data, status, headers, config) {
                });
            };

            $scope.job_enable = function (jenkins, jobName) {
                $http({
                    method: 'GET',
                    url: 'http://127.0.0.1:3000/jenkinses/jobs/' + jenkins._id + '/' + jobName + '/enable'
                })
            };

            $scope.job_disable = function (jenkins, jobName) {
                $http({
                    method: 'GET',
                    url: 'http://127.0.0.1:3000/jenkinses/jobs/' + jenkins._id + '/' + jobName + '/disable'
                })
            };

            $scope.job_delete = function (jenkins, jobName) {
                $http({
                    method: 'GET',
                    url: 'http://127.0.0.1:3000/jenkinses/jobs/' + jenkins._id + '/' + jobName + '/delete'
                })
            };
        }]);