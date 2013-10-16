/*global angular, jQuery, _*/
(function () {
'use strict';

angular.module('app')
    .controller('TwitterController', ['$scope', 'rest', function ($scope, rest) {
        $scope.appURL = '#';
        $scope.appId = rest.getAppId(settings.twitter.appName);
        $scope.$watch('appId', function (appId) {
            if (appId) {
                $scope.appURL = settings.appsURL + appId;
            }
        });
    }])
    .controller('TwitterGridControlller', ['$scope', 'socket', function ($scope, socket) {
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
    }]);

})();
