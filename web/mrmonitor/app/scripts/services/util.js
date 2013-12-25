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

'use strict';

angular.module('app.service')
  .service('util', function ($q, $timeout) {
    return {
      extractJobId: function (value) {
        if (!value) {
          return value;
        }

        return value.match(/\d.*/)[0];
      },

      delay: function (promise) { // for dev only
        var deferred = $q.defer();

        promise.then(function (value) {
          $timeout(function () {
            deferred.resolve(value);
          }, 2000);
        });

        return deferred.promise;
      },

      minuteSeries: function (values, now) {
        var time = now ? now : Date.now();
        var count = values.length;
        var minute = 60 * 1000;

        return _.map(values, function (value, index) {
          return {
            timestamp: time - (count - 1 - index) * minute,
            value: value
          };
        });
      }
    };
  });
