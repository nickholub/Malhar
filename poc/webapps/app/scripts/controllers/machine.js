/*global angular, jQuery, _*/
(function () {
'use strict';

//TODO implement AngularJS directive for google charts
function drawChart(data, options) {
    var table = new google.visualization.DataTable();
    table.addColumn('datetime', 'Time');
    table.addColumn('number');
    table.addRows(data.length);

    var chart = new google.visualization.ScatterChart(document.getElementById(options.container));
    var view = new google.visualization.DataView(table);

    var property = options.property;
    for(var i=0; i < data.length; i++)
    {
        var item = data[i];
        table.setCell(i, 0, new Date(item.timestamp));
        table.setCell(i, 1, parseFloat(item[property]));
    }

    chart.draw(view, { lineWidth: 1, pointSize: 0, legend: 'none', height: 300 });
}

angular.module('machine')
    .controller('MachineController', ['$scope', '$timeout', 'rest', function ($scope, $timeout, rest) {
        $scope.appURL = '#';
        $scope.appId = rest.getAppId(settings.machine.appName);
        $scope.$watch('appId', function (appId) {
            if (appId) {
                $scope.appURL = settings.appsURL + appId;
            }
        });

        $scope.$watch('machineData', function (data) {
            if (data) {
                drawChart(data, {
                    container: 'cpuChart',
                    property: 'cpu'
                });
                drawChart(data, {
                    container: 'ramChart',
                    property: 'ram'
                });
                drawChart(data, {
                    container: 'hddChart',
                    property: 'hdd'
                });
            }
        });

        function fetchMachineData () {
            $scope.machineData = rest.getMachineData();
            $timeout(fetchMachineData, 1000);
        }

        fetchMachineData();
    }]);

})();
