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

angular.module('app.service.kafka', [])
  .factory('KafkaRestService', function ($http, $interval, $q, util, settings) {
    function KafkaRestService(callback, scope) {
      this.callback = callback;
      this.sendInterval = null;
      this.pollInterval = null;
      this.dataUrl = '/data'; //TODO

      if (settings.restHost) {
        this.dataUrl = settings.restHost + this.dataUrl;
      }

      scope.$on('$destroy', this.clearIntervals.bind(this));
    }

    KafkaRestService.prototype = {
      send: function (query) {
        //$scope.requestSendTime = Date.now();
        //$scope.nextRequestSendTime = Date.now() + settings.keepAliveInterval;
        $http.post(this.dataUrl, query);
      },

      poll: function (message, callback) {
        var callbackFn = callback ? callback : this.callback;

        $http.get(this.dataUrl, {
          params: {
            id: message.id,
            t: Date.now()
          }
        }).success(function (data) {
          //$scope.kafkaMessage = data;

          var valid = false;
          if (data && data.value) {
            var value = JSON.parse(data.value);

            if (message.id === value.id) { // ignore stale responses
              //$scope.kafkaMessage.value = '<see data below>';
              //$scope.value = value;

              var valueData = value.data;
              if (valueData) {
                //topN = valueData.reverse();
              } else {
                //topN = [];
              }

              callbackFn(valueData, data); //TODO
              valid = true;
            }
          }

          if (!valid) {
            callbackFn(null, value);
            //topN = [];
            //$scope.value = '';
          }
        }.bind(this));
      },

      subscribe: function (query) {
        this.query = angular.copy(query);
        this.query.id = util.generateId(this.query);

        this.clearIntervals();

        this.send(this.query);
        this.poll(this.query);

        this.sendInterval = $interval(function () {
          this.send(this.query);
        }.bind(this), settings.keepAliveInterval);

        this.pollInterval = $interval(function () {
          this.poll(this.query);
        }.bind(this), settings.pollInterval);
      },

      clearIntervals: function () {
        $interval.cancel(this.pollInterval);
        $interval.cancel(this.sendInterval);
      },

      fetch: function (query) {
        var deferred = $q.defer();

        query.id = util.generateId(query);

        this.clearIntervals();

        this.send(query);
        this.poll(query);

        this.pollInterval = $interval(function () {
          this.poll(query, function (data) {
            if (data) {
              this.clearIntervals();
              this.callback(data);
            }
          }.bind(this));
        }.bind(this), settings.pollInterval);

        return deferred.promise;
      },

      getQuery: function () {
        return this.query;
      }
    };

    return KafkaRestService;
  })
  .factory('util', function () {
    return {
      generateId: function (msg) {
        var copy = _.clone(msg); // shallow copy
        delete copy.id; // do not include id if it was passed with the object
        return JSON.stringify(copy);
      }
    };
  });

