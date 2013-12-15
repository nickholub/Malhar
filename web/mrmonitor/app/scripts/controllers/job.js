'use strict';

angular.module('app.controller', ['ngGrid', 'app.service']);

angular.module('app.controller')
  .controller('JobCtrl', function ($scope, $stateParams, util) {
    if ($stateParams.jobId) {
      $scope.activeJobId = util.extractJobId($stateParams.jobId);
      $scope.$emit('activeJobId', $scope.activeJobId);
    }
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
    var defaultRow = {
      complete: '-',
      running: '-',
      total: '-',
      progress: 0
    };

    function createRow(data) {
      var row = jQuery.extend({}, data);
      if (typeof data.progress !== 'undefined') {
        row.progress = $filter('number')(data.progress, 2) + '%'; //TODO create custom filter
      } else {
        row.progress = '100.00%';
      }

      row.selected = true;

      return row;
    }

    $scope.gridData = [
      createRow(jQuery.extend({ name: 'map' }, defaultRow)),
      createRow(jQuery.extend({ name: 'reduce' }, defaultRow)),
      createRow(jQuery.extend({ name: 'total' }, defaultRow))
    ];

    $scope.$watch('job', function (job) {
      if (!job) {
        return;
      }

      var jobId = util.extractJobId(job.id);

      if ($scope.activeJobId !== jobId) {
        return;
      }

      var list = [];
      var map = {
        name: 'map',
        complete: job.mapsCompleted,
        running: job.mapsRunning,
        total: job.mapsTotal,
        progress: job.hasOwnProperty('mapProgress') ? job.mapProgress : 100
      };
      var reduce = {
        name: 'reduce',
        complete: job.reducesCompleted,
        running: job.reducesRunning,
        total: job.reducesTotal,
        progress: job.hasOwnProperty('reduceProgress') ? job.reduceProgress : 100
      };
      var total = {
        name: 'total',
        complete: job.mapsCompleted + job.reducesCompleted,
        running: job.mapsRunning + job.reducesRunning,
        total: job.mapsTotal + job.reducesTotal
      };
      total.progress = (total.total === 0) ? 0 : (total.complete / total.total * 100);

      list.push(createRow(map));
      list.push(createRow(reduce));
      list.push(createRow(total));

      $scope.gridData = list;

      //TODO remove active class from progress bar when progress is 100%
      var progress = {
        map: {
          progress: map.progress,
          active: (map.progress < 100)
        },
        reduce: {
          progress: reduce.progress,
          active: (reduce.progress < 100)
        },
        total: {
          progress: total.progress,
          active: (total.complete < total.total)
        }
      };

      $scope.progress = progress;
    });

    var progress = {
      map: {
        progress: 0,
        active: false
      },
      reduce: {
        progress: 0,
        active: false
      },
      total: {
        progress: 0,
        active: false
      }
    };
    $scope.progress = progress;

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

      if ($scope.activeJobId !== taskObject.id) {
        return;
      }

      $scope.gridData = taskObject.tasks;
      $scope.$apply();
    }, $scope);

    $scope.gridOptions = {
      data: 'gridData',
      enableRowSelection: false,
      multiSelect: false,
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

      //console.log(taskObject.id + ' ' + ($scope.activeJobId === taskObject.id));

      if ($scope.activeJobId !== taskObject.id) {
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
