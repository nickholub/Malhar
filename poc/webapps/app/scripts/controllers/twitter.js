/*global angular, jQuery, _*/
(function () {
'use strict';

angular.module('app')
    .controller('TwitterController', ['$scope', 'socket', 'Restangular', function ($scope, socket, Restangular) {
        $scope.appURL = '#';

        var appName = settings.twitter.appName;

        Restangular.one('applications').get().then(function (response) {
            //console.log(response.apps.app);
            //var apps = _.where(response.apps.app, { name: appName, state: 'RUNNING' });
            var apps = _.where(response.apps.app, { name: appName, state: 'RUNNING' });

            apps = _.sortBy(apps, function (app) { return parseInt(app.elapsedTime) });
            //var app = _.findWhere(data.apps, { name: appName, state: 'RUNNING' });
            var app = apps[0];

            $scope.appId = app.id;
            $scope.appURL = settings.appsURL + app.id;
        });
    }])
    .controller('ApplicationTextController', ['$scope', 'socket', 'Restangular', function ($scope, socket, Restangular) {
        //$scope.appText = '';

        //Restangular.one('applications').get().then(function (data) {
        //    var app = _.findWhere(data.apps, { name: 'TwitterCustomerApplication', state: 'RUNNING' });
        //    $scope.appText = JSON.stringify(app, null, 2);
        //});
    }])
    .controller('TwitterGridControlller', ['$scope', 'socket', 'Restangular', function ($scope, socket, Restangular) {
        var topic = "demos.twitter.topURLs";

        socket.subscribe(topic, function(data) {
            var list = [];
            jQuery.each(data.data, function(key, value) {
                list.push( { name: key, value: parseInt(value) } );
            });
            list = _.sortBy(list, function(item) {
                return -item.value;
            });
            $scope.myData = list;
            $scope.$apply();
        });

        $scope.gridOptions = {
            data: 'myData',
            enableColumnResize: true,
            columnDefs: [{ field: "name", displayName: 'URL', width: '80%', sortable: false },
                { field: "value", displayName: 'Count', width: '20%', sortable: false }]
        };
    }])
    .controller('TwitterBarChartController', ['$scope', 'socket', function($scope, socket) {
        socket.on('demos.twitter.topURLs', function(data) {
            var list = [];
            jQuery.each(data.data, function(key, value) {
                list.push( { name: key, value: parseInt(value) } );
            });
            list = _.sortBy(list, function(item) {
                return -item.value;
            });
            //var max = _.max(list, function(item) {item.value});
            var max = list[0].value;
            _.each(list, function(item) {
                item.name += ' - ' + item.value;
                item.score = item.value / max * 100;
            });

            $scope.twitterBarChartData = list;
            $scope.$apply();
        });
        $scope.twitterBarChartData = [];
    }])
    .controller('AppDAGController', ['$scope', 'socket', 'Restangular', function($scope, socket, Restangular) {
        $scope.text = '';
        $scope.$watch('appId', function (appId) {
            if (appId) {
                Restangular.one('applications', appId).one('logicalPlan').get().then(function (data) {
                    $scope.text = JSON.stringify(data, null, 2);
                });
            }
        });
    }]);

})();
