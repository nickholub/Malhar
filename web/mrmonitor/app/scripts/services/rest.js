'use strict';

angular.module('app.service', ['ng', 'restangular', 'ui.notify']);

angular.module('app.service')
  .factory('rest', function($q, Restangular, notificationService) {
    return {
      getApp: function (appName) {
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
              errorMessage = appName + ' is not found. Please make sure application is running.'; //TODO
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