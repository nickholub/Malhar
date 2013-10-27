/*
 * Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global settings, angular, google, jQuery, _*/
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
        var value = parseFloat(item[property]);
        table.setCell(i, 1, value);
    }

    var chartOptions = { lineWidth: 1, pointSize: 0, legend: 'none', height: 300,
        vAxis: { format: settings.machine.metricformat },
        chartArea: { top: 20, height: 240 } };

    chart.draw(view, chartOptions);
}

angular.module('machine')
    .controller('MachineController', ['$scope', '$timeout', '$location', '$routeParams', 'rest', function ($scope, $timeout, $location, $routeParams, rest) {
        $scope.app = rest.getApp(settings.machine.appName);

        $scope.$watch('app', function (app) {
            if (app) {
                $scope.appURL = settings.appsURL + app.id;
            }
        });

        $scope.cpu = 0;
        $scope.ram = 0;
        $scope.hdd = 0;

        $scope.range = function (name) {
            var r = settings.machine.range[name];
            return _.range(r.start, r.stop + 1);
        };

        function setupSelect(name, label) {
            var rangeValues = $scope.range(name);
            var list = _.map(rangeValues, function (value) {
                return {
                    value: String(value),
                    label: label + ' ' + value
                }
            });
            list.splice(0, 0, { value: "", label: 'ALL '});

            $scope.select[name] = list;

            var selected = null;

            if ($routeParams[name]) {
                selected = _.findWhere(list, { value: $routeParams[name] });
            }

            if (selected) {
                $scope[name] = selected;
            } else {
                $scope[name] = list[0];
            }
        }

        $scope.select = {};
        setupSelect('customer', 'Customer');
        setupSelect('product', 'Product');
        setupSelect('os', 'OS');
        setupSelect('software1', 'Software1 Version');
        setupSelect('software2', 'Software2 Version');
        setupSelect('deviceId', 'Device ID');
        $scope.lookback = $routeParams.lookback ? parseInt($routeParams.lookback) : 30;

        function getParams() {
            return {
                customer: $scope.customer.value,
                product: $scope.product.value,
                os: $scope.os.value,
                software1: $scope.software1.value,
                software2: $scope.software2.value,
                deviceId: $scope.deviceId.value,
                lookback: $scope.lookback
            }
        }

        $scope.reload = function () {
            //$location.path('/home/2/customer/5');
            //console.log(window.location);
            //TODO
            window.location.href = window.location.pathname + '#/?' + jQuery.param(getParams());

            //window.location.href = window.location.pathname + '#/?customer=' + $scope.customer.value
            //    + '&product=' + $scope.product.value;
        }

        $scope.$watch('machineData', function (data) {
            if (data && (data.length > 0)) {
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

                var current = _.last(data);
                $scope.cpu = parseFloat(current.cpu);
                $scope.ram = parseFloat(current.ram);
                $scope.hdd = parseFloat(current.hdd);
            }
        });

        function fetchMachineData () {
            rest.getMachineData(getParams()).then(function (response) {
                $scope.machineData = response;
                $timeout(fetchMachineData, 1000);
            });
        }

        fetchMachineData();
    }]);

})();
