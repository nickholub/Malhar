/*global angular*/
(function () {
'use strict';

angular.module('rest', ['ng', 'restangular'])
    .factory('rest', ['$q', 'Restangular', function($q, Restangular) {
        return {
            getAppId: function (appName) {
                var deferred = $q.defer();
                //Restangular.one('applications').get().then(function (response) {
                Restangular.oneUrl('applications', 'stram/v1/applications').get().then(function (response) {
                    var apps = _.where(response.apps.app, { name: appName, state: 'RUNNING' });
                    apps = _.sortBy(apps, function (app) { return parseInt(app.elapsedTime) });
                    var app = apps[0];
                    deferred.resolve(app.id);
                });
                return deferred.promise;
            },
            getMachineData: function (query) {
                //Restangular.all('machine').getList().then(function (response) {
                //    console.log(response);
                //});
                return Restangular.all('machine').getList(query);
            }
        };
    }])
    .run(function(Restangular) {
        //Restangular.setBaseUrl('/ws/v1');
        //Restangular.setBaseUrl('/stram/v1');
    });
})();