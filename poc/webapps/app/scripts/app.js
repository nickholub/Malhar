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
    });

angular.module('mobile', ['rest', 'widgets', 'ngGrid', 'google-maps']);

angular.module('mobile')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/mobile.html',
                controller: 'MobileController'
            })
            .otherwise({
                redirectTo: '/'
            });
    });

angular.module('machine', ['rest', 'widgets']);

angular.module('machine')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/machine.html',
                controller: 'MachineController'
            })
            .otherwise({
                redirectTo: '/'
            });
    });

angular.module('fraud', ['rest', 'widgets']);

angular.module('fraud')
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/fraud.html',
                controller: 'FraudController'
            })
            .otherwise({
                redirectTo: '/'
            });
    });

})();


    
    