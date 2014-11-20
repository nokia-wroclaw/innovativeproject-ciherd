'use strict';

angular.module('mean.jenkinses',
    ['ngTable'])

    .controller('JenkinsesController',
    ['$scope', '$stateParams', '$location', 'Global', 'Jenkinses',
        function ($scope, $stateParams, $location, Global, Jenkinses) {
            $scope.global = Global;
            $scope.enableAuth = false;

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
    ])

    .controller('JenkinsesListController',
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

                getData: function ($defer) {
                 $defer.resolve(data);
                 }

                /*getData: function ($defer, params) {
                    $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }*/

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
                $http({
                    method: 'GET',
                    url: 'http://127.0.0.1:3000/jenkinses/' + jenkins._id + '/status'
                }).success(function (data) {
                    jenkins.ConnectionStatus.Online = data;
                });
            };

        }])

    .controller('JobListController',
    ['$scope', '$filter', '$q', 'ngTableParams', 'Jenkinses', '$http', '$stateParams',
        function ($scope, $filter, $q, ngTableParams, Jenkinses, $http) {
            var data = Jenkinses.query(function (jenkinses) {
                $scope.jenkinses = jenkinses;
            });

            $scope.find = function () {
                Jenkinses.query(function (jenkinses) {
                    $scope.jenkinses = jenkinses;
                });
            };

            /*jshint -W055 */
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
                });
            };

            $scope.job_disable = function (jenkins, jobName) {
                $http({
                    method: 'GET',
                    url: 'http://127.0.0.1:3000/jenkinses/jobs/' + jenkins._id + '/' + jobName + '/disable'
                });
            };

            $scope.job_delete = function (jenkins, jobName) {
                $http({
                    method: 'GET',
                    url: 'http://127.0.0.1:3000/jenkinses/jobs/' + jenkins._id + '/' + jobName + '/delete'
                });
            };

            $scope.job_build = function (jenkins, jobName) {
                $http({
                    method: 'GET',
                    url: 'http://127.0.0.1:3000/jenkinses/jobs/' + jenkins._id + '/' + jobName + '/build'
                });
            };
        }])

    .controller('PluginListController',
    ['$scope', '$stateParams', '$filter', '$q', 'ngTableParams', 'Jenkinses',
        function ($scope, $stateParams, $filter, $q, ngTableParams, Jenkinses) {
	    
            /*jshint quotmark: double */
            var x = {
                "_id": "546c9b0e32a93e5109006f4f",
                "description": "Dzenkins Mateusz",
                "url": "http://vps1.soltysik.org:8080/",
                "UserID": "x",
                "APIToken": "x",
                "__v": 69,
                "plugins": [{
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Jenkins Mailer Plugin",
                    "shortName": "mailer",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/Mailer",
                    "version": "1.12",
                    "_id": "546e7235659e0ccb24545d6e"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "External Monitor Job Type Plugin",
                    "shortName": "external-monitor-job",
                    "url": "https://wiki.jenkins-ci.org/display/JENKINS/Monitoring+external+jobs",
                    "version": "1.4",
                    "_id": "546e7235659e0ccb24545d6d"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "JUnit Plugin",
                    "shortName": "junit",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/JUnit+Plugin",
                    "version": "1.2",
                    "_id": "546e7235659e0ccb24545d6c"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "SSH Credentials Plugin",
                    "shortName": "ssh-credentials",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/SSH+Credentials+Plugin",
                    "version": "1.10",
                    "_id": "546e7235659e0ccb24545d6b"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Jenkins Subversion Plug-in",
                    "shortName": "subversion",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/Subversion+Plugin",
                    "version": "2.4.5",
                    "_id": "546e7235659e0ccb24545d6a"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Credentials Plugin",
                    "shortName": "credentials",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/Credentials+Plugin",
                    "version": "1.18",
                    "_id": "546e7235659e0ccb24545d69"
                }, {
                    "active": true,
                    "bundled": false,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Jenkins GIT plugin",
                    "shortName": "git",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/Git+Plugin",
                    "version": "2.3",
                    "_id": "546e7235659e0ccb24545d68"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Jenkins CVS Plug-in",
                    "shortName": "cvs",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/CVS+Plugin",
                    "version": "2.12",
                    "_id": "546e7235659e0ccb24545d67"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": false,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Ant Plugin",
                    "shortName": "ant",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/Ant+Plugin",
                    "version": "1.2",
                    "_id": "546e7235659e0ccb24545d66"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Javadoc Plugin",
                    "shortName": "javadoc",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/Javadoc+Plugin",
                    "version": "1.3",
                    "_id": "546e7235659e0ccb24545d65"
                }, {
                    "active": true,
                    "bundled": false,
                    "deleted": false,
                    "downgradable": false,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "MapDB API Plugin",
                    "shortName": "mapdb-api",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/MapDB+API+Plugin",
                    "version": "1.0.6.0",
                    "_id": "546e7235659e0ccb24545d64"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": false,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Windows Slaves Plugin",
                    "shortName": "windows-slaves",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/Windows+Slaves+Plugin",
                    "version": "1.0",
                    "_id": "546e7235659e0ccb24545d63"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "LDAP Plugin",
                    "shortName": "ldap",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/LDAP+Plugin",
                    "version": "1.11",
                    "_id": "546e7235659e0ccb24545d62"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Jenkins Translation Assistance plugin",
                    "shortName": "translation",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/Translation+Assistance+Plugin",
                    "version": "1.12",
                    "_id": "546e7235659e0ccb24545d61"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "PAM Authentication plugin",
                    "shortName": "pam-auth",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/PAM+Authentication+Plugin",
                    "version": "1.2",
                    "_id": "546e7235659e0ccb24545d60"
                }, {
                    "active": true,
                    "bundled": false,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Jenkins GIT client plugin",
                    "shortName": "git-client",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/Git+Client+Plugin",
                    "version": "1.11.1",
                    "_id": "546e7235659e0ccb24545d5f"
                }, {
                    "active": true,
                    "bundled": false,
                    "deleted": false,
                    "downgradable": false,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "SCM API Plugin",
                    "shortName": "scm-api",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/SCM+API+Plugin",
                    "version": "0.2",
                    "_id": "546e7235659e0ccb24545d5e"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Maven Integration plugin",
                    "shortName": "maven-plugin",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/Maven+Project+Plugin",
                    "version": "2.7.1",
                    "_id": "546e7235659e0ccb24545d5d"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Jenkins SSH Slaves plugin",
                    "shortName": "ssh-slaves",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/SSH+Slaves+plugin",
                    "version": "1.9",
                    "_id": "546e7235659e0ccb24545d5c"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Matrix Authorization Strategy Plugin",
                    "shortName": "matrix-auth",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/Matrix+Authorization+Strategy+Plugin",
                    "version": "1.2",
                    "_id": "546e7235659e0ccb24545d5b"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "Matrix Project Plugin",
                    "shortName": "matrix-project",
                    "url": "https://wiki.jenkins-ci.org/display/JENKINS/Matrix+Project+Plugin",
                    "version": "1.4",
                    "_id": "546e7235659e0ccb24545d5a"
                }, {
                    "active": true,
                    "bundled": true,
                    "deleted": false,
                    "downgradable": true,
                    "enabled": true,
                    "hasUpdate": false,
                    "longName": "OWASP Markup Formatter Plugin",
                    "shortName": "antisamy-markup-formatter",
                    "url": "http://wiki.jenkins-ci.org/display/JENKINS/OWASP+Markup+Formatter+Plugin",
                    "version": "1.3",
                    "_id": "546e7235659e0ccb24545d59"
                }],
                "jobs": [{
                    "name": "FirstProject",
                    "url": "http://vps1.soltysik.org:8080/job/FirstProject/",
                    "color": "red",
                    "_id": "546e720770b30e9c2488367b"
                }, {
                    "name": "Zjem Cie",
                    "url": "http://vps1.soltysik.org:8080/job/Zjem%20Cie/",
                    "color": "blue",
                    "_id": "546e720770b30e9c2488367a"
                }],
                "ConnectionStatus": {"Online": true, "timestamp": "2014-11-20T21:59:36.194Z"},
                "created": "2014-11-19T13:28:46.337Z"
            };
            var data = x.plugins;

            /*jshint -W055 */
            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 10           // count per page
            }, {
                total: data.length, // length of data
                getData: function ($defer, params) {
                    $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });
        }]);
