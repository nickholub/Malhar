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