/*global angular, jQuery*/
(function () {
'use strict';

angular.module('app')
    .controller('MainCtrl', function($scope) {
        //TODO
        //console.log('MainCtrl');
    })
    .controller('BarChartController', ['$scope', function($scope) {
        $scope.title = "DemoCtrl";
        var data = [
            {name: "Total", score: 10 },
            {name: "Map", score: 50 },
            {name: "Reduce", score: 70}
        ];

        data.forEach(function(item) {
            item.name += ' - ' + item.score + '%';
        });

        $scope.d3Data = data;
    }])
    .controller('JobTextController', ['$scope', 'socket', function($scope, socket) {
        $scope.jobText = 'job response';

        var topic = "contrib.summit.mrDebugger.jobResult";
        var msg = JSON.stringify({ "type":"subscribe", "topic": topic});
        socket.send(msg);

        socket.on(topic, function(message) {
            var data = JSON.parse(message.data);
            $scope.jobText = JSON.stringify(data, null, 2);
            $scope.$apply();
        });
    }])
    .controller('JobGridController', ['$scope', '$filter', 'socket', function($scope, $filter, socket) {
        var defaultRow = {
            completed: '-',
            running: '-',
            total: '-',
            progress: 0
        };

        function createRow(data) {
            var row = jQuery.extend({}, data);
            if (typeof data.progress !== 'undefined') {
                row.progress = $filter('number')(data.progress, 2) + '%'; //TODO create custom filter
            } else {
                row.progress = '100.00%';
            }

            return row;
        }

        $scope.gridData = [
            createRow(jQuery.extend({ name: 'map' }, defaultRow)),
            createRow(jQuery.extend({ name: 'reduce' }, defaultRow)),
            createRow(jQuery.extend({ name: 'total' }, defaultRow))
        ];

        var topic = "contrib.summit.mrDebugger.jobResult";
        var msg = JSON.stringify({ "type":"subscribe", "topic": topic});
        socket.send(msg);

        socket.on(topic, function(message) {
            var data = JSON.parse(message.data);
            var job = data.job;

            var list = [];
            var map = {
                name: 'map',
                completed: job.mapsCompleted,
                running: job.mapsRunning,
                total: job.mapsTotal,
                progress: job.mapProgress
            };
            var reduce = {
                name: 'reduce',
                completed: job.reducesCompleted,
                running: job.reducesRunning,
                total: job.reducesTotal,
                progress: job.reduceProgress
            };
            var total = {
                name: 'total',
                completed: job.mapsCompleted + job.reducesCompleted,
                running: job.mapsRunning + job.reducesRunning,
                total: job.mapsTotal + job.reducesTotal
            };
            total.progress = (total.total === 0) ? 0 : (total.completed / total.total * 100);

            list.push(createRow(map));
            list.push(createRow(reduce));
            list.push(createRow(total));

            $scope.gridData = list;
            $scope.$apply();
        });

        $scope.gridOptions = {
            data: 'gridData',
            columnDefs: [
                { field: "name", displayName: 'Task'},
                { field: "completed", displayName: 'Completed' },
                { field: "running", displayName: 'Running' },
                { field: "total", displayName: 'Total' },
                { field: "progress", displayName: 'Progress', cellFilter1: 'number:2' }
            ]
        };

    }])
    .controller('JobBarChartController', ['$scope', '$filter', 'socket', function($scope, $filter, socket) {
        var defaultRow = {
            completed: '-',
            running: '-',
            total: '-',
            progress: 0
        };

        var labelTemplate = '$task: $completed/$total ($progress%)';
        function createRow(data) {
            var score = (typeof data.progress !== 'undefined') ? data.progress : 100;
            var progress = $filter('number')(score, 2); //TODO create custom filter
            var label = labelTemplate.replace('$task', data.name)
                .replace('$completed', data.completed)
                .replace('$total', data.total)
                .replace('$progress', progress);

            return { name: label, score: score };
        }

        $scope.jobBarChartData = [
            createRow(jQuery.extend({ name: 'map' }, defaultRow)),
            createRow(jQuery.extend({ name: 'reduce' }, defaultRow)),
            createRow(jQuery.extend({ name: 'total' }, defaultRow))
        ];

        function calcProgress(completed, total) {
            return (total === 0) ? 0 : (completed / total * 100);
        }

        var topic = "contrib.summit.mrDebugger.jobResult";
        var msg = JSON.stringify({ "type":"subscribe", "topic": topic});
        socket.send(msg);

        socket.on(topic, function(data) {
            data = JSON.parse(data.data);
            var job = data.job;

            var list = [];
            var map = {
                name: 'map',
                completed: job.mapsCompleted,
                total: job.mapsTotal,
                progress: job.mapProgress
            };
            var reduce = {
                name: 'reduce',
                completed: job.reducesCompleted,
                total: job.reducesTotal,
                progress: job.reduceProgress
            };
            var total = {
                name: 'total',
                completed: job.mapsCompleted + job.reducesCompleted,
                total: job.mapsTotal + job.reducesTotal
            };
            total.progress = calcProgress(total.completed, total.total);

            list.push(createRow(map));
            list.push(createRow(reduce));
            list.push(createRow(total));

            $scope.jobBarChartData = list;
            $scope.$apply();
        });
    }])
    .controller('MapTextController', ['$scope', 'socket', function($scope, socket) {
        $scope.mapText = 'map response';

        var topic = "contrib.summit.mrDebugger.mapResult";
        var msg = JSON.stringify({ "type":"subscribe", "topic": topic});
        socket.send(msg);

        socket.on(topic, function(message) {
            var data = JSON.parse(message.data);
            $scope.mapText = JSON.stringify(data, null, 2);
            $scope.$apply();
        });
    }])
    .controller('ReduceTextController', ['$scope', 'socket', function($scope, socket) {
        $scope.reduceText = 'reduce response';

        var topic = "contrib.summit.mrDebugger.reduceResult";
        var msg = JSON.stringify({ "type":"subscribe", "topic": topic});
        socket.send(msg);

        socket.on(topic, function(message) {
            var data = JSON.parse(message.data);
            $scope.reduceText = JSON.stringify(data, null, 2);
            $scope.$apply();
        });
    }]);

})();