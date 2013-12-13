'use strict';

angular.module('app.controller', ['ngGrid', 'app.service']);

angular.module('app.controller')
  .controller('MainCtrl', function ($scope, webSocket, rest, util) {
    rest.getApp('word count').then(function (app) {
      if (app && app.id) {
        $scope.app = app;

        var id = util.extractJobId(app.id);
        $scope.activeJobId = id;

        var jsonData = {
          'command': 'add',
          'hostname': settings.hadoop.host,
          'app_id': id,
          'job_id': id,
          'hadoop_version': settings.hadoop.version,
          'api_version': settings.hadoop.api,
          'rm_port': settings.hadoop.resourceManagerPort,
          'hs_port': settings.hadoop.historyServerPort
        };

        var topic = 'contrib.summit.mrDebugger.mrDebuggerQuery';
        var msg = { type: 'publish', topic: topic, data: jsonData };
        webSocket.send(msg);
      }
    });

    webSocket.subscribe(settings.topic.job, function(message) {
      var data = JSON.parse(message);
      //console.log(data);
      $scope.job = data.job;
      $scope.$apply();
    });
  })
  .controller('JobGridController', function($scope, $filter, webSocket, util) {
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

      return row;
    }

    $scope.gridData = [
      createRow(jQuery.extend({ name: 'map' }, defaultRow)),
      createRow(jQuery.extend({ name: 'reduce' }, defaultRow)),
      createRow(jQuery.extend({ name: 'total' }, defaultRow))
    ];

    $scope.$watch('job', function(job) {
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
      columnDefs: [
        { field: 'name', displayName: 'Task'},
        { field: 'complete', displayName: 'Complete' },
        { field: 'running', displayName: 'Running' },
        { field: 'total', displayName: 'Total' },
        { field: 'progress', displayName: 'Progress', cellFilter1: 'number:2' }
      ]
    };

  })
  .controller('MonitoredJobGridController', function($scope) {
    var jobs = {};

    $scope.$watch('job', function (job) {
      if (!job) {
        return;
      }

      jobs[job.id] = job;
      var list = _.map(_.values(jobs), function (job) {
        return {
          id: job.id,
          name: job.name,
          state: job.state,
          mapProgress: job.mapProgress,
          reduceProgress: job.reduceProgress
        };
      });
      $scope.gridData = list;
    });

    $scope.gridOptions = {
      data: 'gridData',
      columnDefs: [
        { field: 'id', displayName: 'Id', width: 200 },
        { field: 'name', displayName: 'Name'},
        { field: 'state', displayName: 'State' },
        { field: 'mapProgress', displayName: 'Map Progress', cellFilter: 'percentage' },
        { field: 'reduceProgress', displayName: 'Reduce Progress', cellFilter: 'percentage' }
      ]
    };

  })
  .controller('MapGridController', function ($scope, webSocket) {
    $scope.message = 'none';

    webSocket.subscribe(settings.topic.map, function (data) {
      var taskObject = JSON.parse(data);

      if ($scope.activeJobId !== taskObject.id) {
        return;
      }

      $scope.gridData = taskObject.tasks;
      $scope.$apply();
    });

    $scope.gridOptions = {
      data: 'gridData',
      columnDefs: [
        { field: 'id', displayName: 'Id', width: 270 },
        { field: 'state', displayName: 'State', width: 100 },
        { field: 'progress', displayName: 'Progress', cellFilter: 'percentage' }
      ]
    };
  })
  .controller('ReduceGridController', function ($scope, webSocket) {
    $scope.message = 'none';

    webSocket.subscribe(settings.topic.reduce, function (data) {
      var taskObject = JSON.parse(data);

      if ($scope.activeJobId !== taskObject.id) {
        return;
      }

      $scope.gridData = taskObject.tasks;
      $scope.$apply();
    });

    $scope.gridOptions = {
      data: 'gridData',
      columnDefs: [
        { field: 'id', displayName: 'Id', width: 270 },
        { field: 'state', displayName: 'State', width: 100 },
        { field: 'progress', displayName: 'Progress', cellFilter: 'percentage' }
      ]
    };
  });
