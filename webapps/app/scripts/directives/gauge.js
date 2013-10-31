/**
 * Modified copy of https://github.com/lithiumtech/angular_and_d3/blob/master/step5/custom/gauges.js
 */

/*global Gauge, angular, d3*/
(function () {
'use strict';

    angular.module('widgets').directive( 'gauge', function () {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                label: "@",
                min: "=",
                max: "=",
                value: "="
            },
            link: function (scope, element, attrs) {
                var config = {
                    size: 280,
                    label: attrs.label,
                    min: undefined !== scope.min ? scope.min : 0,
                    max: undefined !== scope.max ? scope.max : 100,
                    minorTicks: 5
                };

                var range = config.max - config.min;
                config.yellowZones = [ { from: config.min + range*0.75, to: config.min + range*0.9 } ];
                config.redZones = [ { from: config.min + range*0.9, to: config.max } ];

                scope.gauge = new Gauge( element[0], config );
                scope.gauge.render();
                scope.gauge.redraw( scope.value );

                scope.$watch('value', function() {
                    if (scope.gauge) {
                        scope.gauge.redraw( scope.value );
                    }
                });
            }
        };
    });

})();