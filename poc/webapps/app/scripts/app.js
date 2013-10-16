/*global angular*/
(function () {
'use strict';

angular.module('app', ['socket', 'ngGrid', 'restangular'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/twitter.html',
                controller: 'TwitterController'
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