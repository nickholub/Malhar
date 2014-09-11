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

angular.module('kafka', [
  'app.service.kafka',
  'nvd3ChartDirectives'
])
  .controller('KafkaCtrl', function ($routeParams, $scope, $interval, $timeout, $http, settings, KafkaRestService, util) {
    var defaultMessage = {
      keys: {
        publisherId: 1,
        advertiserId: 0,
        adUnit: 0
      }
    };

    $scope.requestText = JSON.stringify(defaultMessage, null, ' ');
    $scope.timeSeries = [];
    $scope.mode = 'MINUTES';

    function updateBarChart(timeseries) {
      var metric = 'impressions';

      var values = [];
      if (timeseries && metric) {
        values = _.map(timeseries, function (item) {
          return {
            timestamp: item.timestamp,
            value: item[metric]
          };
        });

        $scope.barChart = [
          {
            key: metric,
            values: values
          }
        ];
      } else {
        $scope.barChart = null;
      }
    }

    var kafkaService = new KafkaRestService(function (data, kafkaMessage) {
      updateBarChart(data);
      //console.log(data.length);

      $scope.kafkaMessage = kafkaMessage;

      if (kafkaMessage && kafkaMessage.value) {
        var kafkaMessageValue = JSON.parse(kafkaMessage.value);
        $scope.kafkaMessageValue = kafkaMessageValue;
        $scope.kafkaMessage.value = '<see data below>';
      } else {
        $scope.kafkaMessageValue = null; //TODO
      }
    }, $scope);


    $scope.sendRequest = function () {
      var msg = null;

      try {
        var msg = JSON.parse($scope.requestText);
      } catch (e) {
        console.log(e);
        $scope.request = 'JSON parse error';
      }

      if (msg) {
        kafkaService.subscribe(msg);
        $scope.request = kafkaService.getQuery();
      }
    };

    $scope.sendRequest();
  });