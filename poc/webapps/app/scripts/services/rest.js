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
                    app.toString = function() {
                        return this.id;
                    }
                    deferred.resolve(app);
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