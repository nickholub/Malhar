/*global angular, jQuery, _*/
(function () {
'use strict';

angular.module('app')
    .controller('TwitterGridControlller', function ($scope, socket) {
        var topic = "demos.twitter.topURLs";
        var msg = JSON.stringify({ "type":"subscribe", "topic": topic});
        socket.send(msg);
        socket.on('demos.twitter.topURLs', function(data) {
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
            columnDefs: [{ field: "name", displayName: 'URL', width: '80%'},
                { field: "value", displayName: 'Count', width: '20%' }]
        };
    })
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
