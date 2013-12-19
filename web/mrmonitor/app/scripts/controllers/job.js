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

'use strict';

angular.module('app.controller')
  .controller('JobCtrl', function ($scope, $stateParams, util) {
    if ($stateParams.jobId) {
      $scope.jobId = util.extractJobId($stateParams.jobId);
      $scope.$emit('activeJobId', $scope.jobId);
    } else {
      $scope.$emit('activeJobId', null);
    }
  })
  .controller('CounterController', function ($scope, webSocket, util) {
    var counterGroups = null;
    var counterGroupNames = null;

    function updateCounterGroup() {
      var group = _.findWhere(counterGroups, { counterGroupName: $scope.counterGroupName });
      $scope.counterGroup = group;
    }

    function updateCounters(counterObject) {
      if (!counterGroupNames) {
        counterGroups = counterObject.jobCounters.counterGroup;
        counterGroupNames = _.pluck(counterGroups, 'counterGroupName');
        $scope.counterGroupNames = counterGroupNames;
        $scope.counterGroupName = counterGroupNames[0];
      } else {
        counterGroups = counterObject.jobCounters.counterGroup;
        updateCounterGroup();
      }
    }

    $scope.$watch('counterGroupName', function (counterGroupName) {
      if (counterGroupName) {
        updateCounterGroup();
      }
    });

    webSocket.subscribe(settings.topic.stats, function (data) {
      var counterObject = JSON.parse(data);

      var jobId = util.extractJobId(counterObject.jobCounters.id);

      if ($scope.jobId !== jobId) {
        return;
      }

      updateCounters(counterObject);

      $scope.$apply();
    }, $scope);
  })
  .controller('MapLineChartController', function ($scope) {
    var items = [];

    $scope.$watch('activeJob', function (job) {
      if (!job) {
        return;
      }

      var item = {
        value: job.mapProgress,
        timestamp: Date.now()
      };

      items.push(item);

      if (items.length > 40) {
        items.shift();
      }

      $scope.chart = {
        data: items,
        max: 30
      };
    });
  })
  .controller('ReduceLineChartController', function ($scope) {
    var items = [];

    $scope.$watch('activeJob', function (job) {
      if (!job) {
        return;
      }

      var item = {
        value: job.reduceProgress,
        timestamp: Date.now()
      };

      items.push(item);

      if (items.length > 40) {
        items.shift();
      }

      $scope.chart = {
        data: items,
        max: 30
      };
    });
  })
  .controller('JobGridController', function ($scope, $filter, webSocket, util) {
    $scope.$watch('job', function (job) {
      if (!job) {
        return;
      }

      var jobId = util.extractJobId(job.id);

      if ($scope.jobId !== jobId) {
        return;
      }

      var jobProgress = {
        map: {
          complete: job.mapsCompleted,
          running: job.mapsRunning,
          total: job.mapsTotal,
          progress: job.hasOwnProperty('mapProgress') ? job.mapProgress : 100
        },
        reduce: {
          complete: job.reducesCompleted,
          running: job.reducesRunning,
          total: job.reducesTotal,
          progress: job.hasOwnProperty('reduceProgress') ? job.reduceProgress : 100
        }
      };
      jobProgress.map.active = (jobProgress.map.progress < 100);
      jobProgress.reduce.active = (jobProgress.reduce.progress < 100);

      $scope.jobProgress = jobProgress;
    });

    $scope.jobProgress = {
      map: {
      },
      reduce: {
      }
    };

    $scope.gridOptions = {
      data: 'gridData',
      // enableRowSelection: false,
      multiSelect: false,
      columnDefs: [
        { field: 'name', displayName: 'Task'},
        { field: 'complete', displayName: 'Complete' },
        { field: 'running', displayName: 'Running' },
        { field: 'total', displayName: 'Total' },
        { field: 'progress', displayName: 'Progress', cellFilter1: 'number:2' }
      ]
    };
  })
  .controller('MapGridController', function ($scope, webSocket, settings) {
    $scope.message = 'none';

    webSocket.subscribe(settings.topic.map, function (data) {
      var taskObject = JSON.parse(data);

      if ($scope.jobId !== taskObject.id) {
        return;
      }

      $scope.gridData = taskObject.tasks;
      $scope.$apply();
    }, $scope);

    $scope.gridOptions = {
      data: 'gridData',
      enableRowSelection: false,
      multiSelect: false,
      showFilter: true,
      columnDefs: [
        { field: 'id', displayName: 'Id', width: 270 },
        { field: 'state', displayName: 'State' },
        { field: 'progress', displayName: 'Progress', cellFilter: 'percentage' }
      ]
    };
  })
  .controller('ReduceGridController', function ($scope, webSocket, settings) {
    $scope.message = 'none';

    webSocket.subscribe(settings.topic.reduce, function (data) {
      var taskObject = JSON.parse(data);

      if ($scope.jobId !== taskObject.id) {
        return;
      }

      $scope.gridData = taskObject.tasks;
      $scope.$apply();
    }, $scope);

    $scope.gridOptions = {
      data: 'gridData',
      columnDefs: [
        { field: 'id', displayName: 'Id', width: 270 },
        { field: 'state', displayName: 'State' },
        { field: 'progress', displayName: 'Progress', cellFilter: 'percentage' }
      ]
    };
  });
