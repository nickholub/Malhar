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
  .factory('rest', function($q, Restangular, notificationService) {
    return {
      getApps: function () {
        var deferred = $q.defer();

        Restangular.oneUrl('apps', 'ws/v1/cluster/apps').get().then(function (response) {
          var errorMessage = null;

          if (response && response.apps && response.apps.app && response.apps.app.length > 0) {
            var apps = _.where(response.apps.app, { applicationType: 'MAPREDUCE' });

            if (apps.length > 0) {
              deferred.resolve(apps);
            } else {
              errorMessage = 'No MAPREDUCE applications found.';
            }
          } else {
            errorMessage = 'No applications available.';
          }

          if (errorMessage) {
            deferred.reject(errorMessage);
            notificationService.notify({
              title: 'Error',
              text: errorMessage,
              type: 'error',
              icon: false,
              hide: false,
              history: false
            });
          }
        });

        return deferred.promise;
      },

      getApp: function () {
        var deferred = $q.defer();

        Restangular.oneUrl('apps', 'ws/v1/cluster/apps').get().then(function (response) {
          var errorMessage = null;
          if (response && response.apps && response.apps.app && response.apps.app.length > 0) {
            //var apps = response.apps.app;
            //var apps = _.where(response.apps.app, { name: appName, state: 'RUNNING' });
            var apps = _.where(response.apps.app, { applicationType: 'MAPREDUCE', state: 'RUNNING' });

            if (apps.length > 0) {
              apps = _.sortBy(apps, function (app) {
                return parseInt(app.elapsedTime, 10);
              });
              var app = apps[0];
              deferred.resolve(app);
            } else {
              errorMessage = 'No MAPREDUCE applications found. Please make sure application is running.'; //TODO
            }
          } else {
            errorMessage = 'No applications available.';
          }

          if (errorMessage) {
            deferred.reject(errorMessage);
            notificationService.notify({
              title: 'Error',
              text: errorMessage,
              type: 'error',
              icon: false,
              hide: false,
              history: false
            });
          }
        });

        return deferred.promise;
      }
    };
  });