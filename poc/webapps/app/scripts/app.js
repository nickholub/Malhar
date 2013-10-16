/*global angular*/
(function () {
'use strict';

angular.module('widgets', ['socket']);
angular.module('app', ['rest', 'socket', 'widgets', 'ngGrid']);

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
})();