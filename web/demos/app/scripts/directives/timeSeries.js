/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
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

'use strict';

angular.module('widgets')
  .directive('wtTimeSeries', function ($filter) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'views/timeSeries.html',
      scope: {
        data: '=data',
        mode: '='
      },
      controller: function ($scope) {
        var filter = $filter('date');

        $scope.summaryDateFormat = 'yyyy/MM/dd HH:mm:ss';
        $scope.dateFormat = 'HH:mm';

        function getFormat(mode) {
          return (mode === 'MINUTES') ? 'HH:mm' : 'MMM dd HH:mm';
        }

        $scope.xAxisTickFormatFunction = function () {
          var format = getFormat($scope.mode);

          return function (d) {
            return filter(d, format);
          };
        };

        $scope.xFunction = function () {
          return function (d) {
            return d.timestamp;
          };
        };
        $scope.yFunction = function () {
          return function (d) {
            return d.value;
          };
        };

        $scope.$watch('mode', function (mode) {
          if (mode) {
            $scope.dateFormat = getFormat(mode);
          }
        });
      },
      link: function postLink(scope) {
        scope.chartData = [{
          key: '',
          values: []
        }];

        scope.metric = null;

        function updateChart(timeseries) {
          var values = _.map(timeseries, function (item) {
            return {
              timestamp: item.timestamp,
              value: item[scope.metric]
            };
          });

          scope.chartData = [{
            key: 'key',
            values: values
          }];
        }

        scope.$watch('data', function (data) {
          if (data && (data.length > 1)) {
            var timeseries = _.sortBy(data, function (item) {
              return item.timestamp;
            });

            var start = timeseries[0].timestamp;
            var end = timeseries[timeseries.length - 1].timestamp;
            scope.start = start;
            scope.end = end;

            var sampleObject = timeseries[0];
            var keys = _.keys(sampleObject);
            keys = _.sortBy(keys, function (key) {
              return key;
            });
            scope.metrics = keys;
            if (!scope.metric) {
              if (_.contains(keys, 'revenue')) {
                scope.metric = 'revenue';
              } else {
                scope.metric = scope.metrics[0];
              }
            };

            updateChart(timeseries);
          }
        });
      }
    };
  });