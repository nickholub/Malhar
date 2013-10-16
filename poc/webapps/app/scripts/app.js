/*global angular*/
(function () {
'use strict';

angular.module('widgets', ['socket']);
angular.module('app', ['socket', 'widgets', 'ngGrid', 'restangular']);

angular.module('app')
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