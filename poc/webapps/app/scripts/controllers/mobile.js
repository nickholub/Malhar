/*global angular, jQuery, _*/
(function () {
'use strict';

angular.module('mobile')
    .controller('MobileController', ['$scope', 'rest', function ($scope, rest) {
        $scope.appURL = '#';
        $scope.appId = rest.getAppId(settings.mobile.appName);
        $scope.$watch('appId', function (appId) {
            if (appId) {
                $scope.appURL = settings.appsURL + appId;
            }
        });
    }]);

})();
