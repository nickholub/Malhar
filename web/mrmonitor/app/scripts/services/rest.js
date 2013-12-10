'use strict';

angular.module('app.service', ['ng', 'restangular']);

angular.module('app.service')
  .factory('rest', ['$q', 'Restangular', function($q, Restangular) {
    return {
      getApp: function (appName) {
        var deferred = $q.defer();

        Restangular.oneUrl('apps', 'ws/v1/cluster/apps').get().then(function (response) {
          console.log(response.apps.app);
          var errorMessage = null;
          if (response && response.apps && response.apps.app && response.apps.app.length > 0) {
            //var apps = _.where(response.apps, { name: appName, state: 'RUNNING' });
            var apps = _.where(response.apps.app, { name: appName });
            if (apps.length > 0) {
              apps = _.sortBy(apps, function (app) { return parseInt(app.elapsedTime, 10); });
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
            jQuery.pnotify({
              title: 'Error',
              text: errorMessage,
              type: 'error',
              icon: false,
              hide: false
            });
          }
        });

        return deferred.promise;
      },

      getMachineData: function (query) {
        var promise = Restangular.one('machine').get(query);

        promise.then(null, function (response) {
          jQuery.pnotify({
            title: 'Error',
            text: 'Error getting data from server. Status Code: ' + response.status,
            type: 'error',
            icon: false,
            hide: false
          });
        });

        return promise;
      },

      getDimensionsData: function (query) {
        var promise = Restangular.one('dimensions').get(query);

        promise.then(null, function (response) {
          jQuery.pnotify({
            title: 'Error',
            text: 'Error getting data from server. Status Code: ' + response.status,
            type: 'error',
            icon: false,
            hide: false
          });
        });

        return promise;
      }
    };
  }])
  .run(function(Restangular) {
    //Restangular.setBaseUrl('/ws/v1');
  });
