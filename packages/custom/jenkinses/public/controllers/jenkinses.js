'use strict';

angular.module('mean.jenkinses', ['ngTable']).
    controller('JenkinsesController', ['$scope', '$stateParams', '$location', 'Global', 'Jenkinses',
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
                    jenkins.$remove();

                    for (var i in $scope.jenkinses) {
                        if ($scope.jenkinses[i] === jenkins) {
                            $scope.jenkinses.splice(i, 1);
                        }
                    }
                } else {
                    $scope.jenkins.$remove(function (response) {
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
        function ($scope, $filter, $q, ngTableParams, Jenkinses) {
        var data = Jenkinses.query(function (jenkinses) {
            $scope.jenkinses = jenkinses;
        });

        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10           // count per page
        }, {
            total: data.length, // length of data
            getData: function ($defer, params) {
                $defer.resolve(data);
            }
        });

        var inArray = Array.prototype.indexOf ?
            function (val, arr) {
                return arr.indexOf(val);
            } :
            function (val, arr) {
                var i = arr.length;
                while (i--) {
                    if (arr[i] === val) return i;
                }
                return -1
            };
        $scope.names = function (column) {
            var def = $q.defer(),
                arr = [],
                names = [];
            angular.forEach(data, function (item) {
                if (inArray(item.name, arr) === -1) {
                    arr.push(item.name);
                    names.push({
                        'id': item.name,
                        'title': item.name
                    });
                }
            });
            def.resolve(names);
            return def;
        };

        $scope.checkboxes = {'checked': false, items: {}};

        // watch for check all checkbox
        $scope.$watch('checkboxes.checked', function (value) {
            angular.forEach($scope.users, function (item) {
                if (angular.isDefined(item.id)) {
                    $scope.checkboxes.items[item.id] = value;
                }
            });
        });

        // watch for data checkboxes
        $scope.$watch('checkboxes.items', function (values) {
            if (!$scope.users) {
                return;
            }
            var checked = 0, unchecked = 0,
                total = $scope.users.length;
            angular.forEach($scope.users, function (item) {
                checked += ($scope.checkboxes.items[item.id]) || 0;
                unchecked += (!$scope.checkboxes.items[item.id]) || 0;
            });
            if ((unchecked == 0) || (checked == 0)) {
                $scope.checkboxes.checked = (checked == total);
            }
            // grayed checkbox
            angular.element(document.getElementById("select_all")).prop("indeterminate", (checked != 0 && unchecked != 0));
        }, true);
    })
;
