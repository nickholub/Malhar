/*global angular*/
(function () {
'use strict';

angular.module('widgets')
    .directive('widgetsStat', ['socket', function (socket) {
        return {
            restrict: 'A',
            templateUrl: 'views/stat.html',
            scope: {
                data: "=",
                label: "@",
                onClick: "&"
            },
            link: function($scope, iElement, iAttrs) {
                $scope.$watch('data', function (appId) {
                    if (appId) {
                        console.log('stat ' + appId);
                        $scope.totalEmitted = 0;
                        $scope.totalProcessed = 0;

                        var topic = 'apps.' + appId + '.operators.list';

                        socket.subscribe(topic, function (message) {
                            var operators = message.data.operators;

                            var emitted = BigInteger.ZERO;
                            var processed = BigInteger.ZERO;
                            //var emitted = new BigInteger('9007199254740992');
                            _.each(operators, function (op) {
                                emitted = emitted.add(new BigInteger(op.tuplesEmittedPSMA10));
                                processed = processed.add(new BigInteger(op.totalTuplesProcessed));
                            });

                            $scope.totalEmitted = emitted.toString();
                            $scope.totalProcessed = processed.toString();
                            $scope.$apply();
                        });
                    }
                });
            }
        };
    }]);

})();
