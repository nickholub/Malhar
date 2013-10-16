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
    }])
    .controller('MobileGridControlller', ['$scope', 'socket', function ($scope, socket) {
        var topic = "demos.mobile.phoneLocationQueryResult";

        var map = {};
        socket.subscribe(topic, function(message) {
            var item = message.data;
            map[item.phone] = item;
            $scope.gridData = _.values(map);
            $scope.$apply();
        });

        $scope.gridOptions = {
            data: 'gridData',
            enableColumnResize: true,
            columnDefs: [
                { field: "phone", displayName: 'Phone', width: '50%', sortable: false },
                { field: "location", displayName: 'Location', width: '50%', sortable: false }]
        };
    }])
    .controller('ExampleController', ['$scope', '$timeout', '$log', function ($scope, $timeout, $log) {
        // Enable the new Google Maps visuals until it gets enabled by default.
        // See http://googlegeodevelopers.blogspot.ca/2013/05/a-fresh-new-look-for-maps-api-for-all.html
        google.maps.visualRefresh = true;

        angular.extend($scope, {

            position: {
                coords: {
                    latitude: 37.375894,
                    longitude: -121.959328
                }
            },

            /** the initial center of the map */
            centerProperty: {
                latitude: 45,
                longitude: -73
            },

            /** the initial zoom level of the map */
            zoomProperty: 12,

            /** list of markers to put in the map */
            markersProperty: [ {
                latitude: 45,
                longitude: -74
            }],

            // These 2 properties will be set when clicking on the map
            clickedLatitudeProperty: null,
            clickedLongitudeProperty: null,

            eventsProperty: {
                click: function (mapModel, eventName, originalEventArgs) {
                    // 'this' is the directive's scope
                    $log.log("user defined event on map directive with scope", this);
                    $log.log("user defined event: " + eventName, mapModel, originalEventArgs);
                }
            }
        });
    }]);

})();
