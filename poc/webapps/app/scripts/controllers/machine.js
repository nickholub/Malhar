/*global angular, jQuery, _*/
(function () {
'use strict';

angular.module('machine')
    .controller('MachineController', ['$scope', 'rest', function ($scope, rest) {
        $scope.appURL = '#';
        $scope.appId = rest.getAppId(settings.machine.appName);
        $scope.$watch('appId', function (appId) {
            $scope.appURL = settings.appsURL + appId;
        });
    }]);

})();
