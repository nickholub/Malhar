/*global angular*/
(function () {
'use strict';

angular.module('app', ['socket', 'ngGrid', 'restangular'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .run(function(Restangular) {
        //Restangular.setBaseUrl('/ws/v1');
        Restangular.setBaseUrl('/stram/v1');
    });

})();