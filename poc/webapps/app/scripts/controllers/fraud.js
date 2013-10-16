/*global angular, jQuery, _*/
(function () {
'use strict';

angular.module('fraud')
    .controller('FraudController', ['$scope', 'rest', function ($scope, rest) {
        $scope.appURL = '#';
        $scope.appId = rest.getAppId(settings.fraud.appName);
        $scope.$watch('appId', function (appId) {
            if (appId) {
                $scope.appURL = settings.appsURL + appId;
            }
        });
    }]);

})();
