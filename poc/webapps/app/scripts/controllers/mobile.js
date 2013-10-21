/*global angular, jQuery, _*/
(function () {
'use strict';

function translateLatLong(item) {
    var match = item.location.match(/\((\d+),(\d+)/); //TODO server should pass this data as numbers
    var lat = parseInt(match[1]);
    var lon = parseInt(match[2]);
    var phone = parseInt(item.phone);

    //TODO magic numbers
    var latitude = 37.40180101292334 + (phone % 4 - 2) * 0.01 - lat * 0.005;
    var longitude = -121.9966721534729 + (phone % 8 - 4) * 0.01 + lon * 0.007;

    return { latitude: latitude, longitude: longitude, label: item.phone };
}

angular.module('mobile')
    .controller('MobileController', ['$scope', 'rest', 'socket', function ($scope, rest, socket) {
        $scope.appURL = '#';
        $scope.appId = rest.getAppId(settings.mobile.appName);
        $scope.$watch('appId', function (appId) {
            if (appId) {
                $scope.appURL = settings.appsURL + appId;
            }
        });
    }])
    .controller('MobileGridControlller', ['$scope', '$filter', 'socket', function ($scope, $filter, socket) {
        var topic = "demos.mobile.phoneLocationQueryResult";

        var map = {};

        $scope.phone = '';
        $scope.addPhone = function () {
            var command = {
                command : 'add',
                phone : $scope.phone
            };

            var topic = 'demos.mobile.phoneLocationQuery';
            var message = { "type" : "publish", "topic" : topic, "data" : command };
            socket.send(message);

            //map[$scope.phone] = { phone: $scope.phone };
            //$scope.gridData = _.values(map);

            $scope.phone = '';
        };

        $scope.removePhone = function(phone) {
            var command = {
                command : 'del',
                phone : phone
            };

            var topic = 'demos.mobile.phoneLocationQuery';
            var message = { "type" : "publish", "topic" : topic, "data" : command };
            socket.send(message);

            delete map[phone];
            $scope.gridData = _.values(map);
        };

        socket.subscribe(topic, function(message) {
            var item = message.data;
            var latlon = translateLatLong(item);
            map[item.phone] = {
                phone: item.phone,
                latitude: $filter('number')(latlon.latitude, 3),
                longitude: $filter('number')(latlon.longitude, 3)
            };
            $scope.gridData = _.values(map);
            $scope.$apply();
        });

        $scope.gridOptions = {
            data: 'gridData',
            enableColumnResize: true,
            enableRowSelection: false,
            columnDefs: [
                { field: "phone", displayName: 'Phone', width: '30%', sortable: false },
                { field: "latitude", displayName: 'Latitude', width: '30%', sortable: false },
                { field: "longitude", displayName: 'Longitude', width: '30%', sortable: false },
                { field: "phone", displayName: '', cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()" ng-click="removePhone(COL_FIELD)"><i class="icon-trash"></i></div>', cellClass: 'mobile-grid-remove', width: '10%', sortable: false }
            ]
        };
    }])
    .controller('MapController', ['$scope', 'socket', function ($scope, socket) {
        google.maps.visualRefresh = true;

        var topic = "demos.mobile.phoneLocationQueryResult";

        var map = {};
        socket.subscribe(topic, function(message) {
            var item = message.data;
            var latlon = translateLatLong(item);
            map[item.phone] = latlon;
            $scope.markersProperty = _.values(map); //TODO update only changed marker
            $scope.$apply();
        });

        angular.extend($scope, {
            position: {
                coords: {
                    latitude: 37.36197126180853,
                    longitude: -121.92674696445465
                }
            },
            zoomProperty: 12
        });
    }]);

})();
