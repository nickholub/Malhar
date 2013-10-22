/*
 * Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global angular, jQuery*/
(function () {
'use strict';

angular.module('app')
    .controller('MainCtrl', function($scope) {
        //TODO
        //console.log('MainCtrl');
    })
    .controller('StatGridController', ['$scope', '$filter', 'socket', function($scope, $filter, socket) {
        $scope.gridData = [];

        var map = {};

        socket.onbuffer(function(buffer, delay) {
            var list = [];
            var total = 0;
            var factor = 1000/delay;

            jQuery.each(buffer, function(topic, messages) {
                var messageCount = messages.length;
                var item;
                if (_.has(map, topic)) {
                    item = map[topic];
                } else {
                    item = {
                        topic: topic,
                        count: 0,
                        current: 0,
                        total: 0,
                        max: 0
                    };
                    map[topic] = item;
                }
                item.count++;
                item.total += messageCount;
                item.current = Math.floor(messageCount * factor);
                item.average = Math.floor(item.total/item.count * factor);
                item.max = (item.current > item.max) ? item.current : item.max;

                total += messages.length;
            });

            $scope.gridData = _.sortBy(_.values(map), function(item) { item.topic });
            $scope.$apply();
        });

        $scope.gridOptions = {
            data: 'gridData',
            columnDefs: [
                { field: "topic", displayName: 'Topic', width: '30%' },
                { field: "average", displayName: 'Average Events/sec' },
                { field: "current", displayName: 'Current Events/sec' },
                { field: "max", displayName: 'Max Events/sec' },
                { field: "total", displayName: 'Total Events' }
            ]
        };
    }]);

})();