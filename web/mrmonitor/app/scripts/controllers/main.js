'use strict';

angular.module('app.controller', ['ngGrid', 'app.service']);

angular.module('app.controller')
  .controller('WebSocketController', function ($scope, webSocket) {
    $scope.message = 'none';

    webSocket.subscribe(settings.topic.map, function (data) {
      $scope.message = JSON.stringify(data);
      $scope.$apply();
    });
  })
  .controller('MainCtrl', function ($scope, webSocket, rest) {
    $scope.app = rest.getApp('word count');

    $scope.$watch('app', function (app) {
      if (app) {
        var id = app.id.replace('application_', '');

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
  })
  .controller('JobGridController', function($scope, $filter, webSocket) {
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

    var topic = settings.topic.job;

    webSocket.subscribe(topic, function(message) {
      var data = JSON.parse(message);
      var job = data.job;

      var list = [];
      var map = {
        name: 'map',
        complete: job.mapsCompleted,
        running: job.mapsRunning,
        total: job.mapsTotal,
        progress: job.mapProgress
      };
      var reduce = {
        name: 'reduce',
        complete: job.reducesCompleted,
        running: job.reducesRunning,
        total: job.reducesTotal,
        progress: job.reduceProgress
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

      var progress = {
        map: {
          progress: job.mapProgress,
          running: (job.mapsCompleted !== job.mapsTotal)
        },
        reduce: {
          progress: job.reduceProgress,
          running: (job.reducesCompleted !== job.reducesTotal)
        },
        total: {
          progress: total.progress,
          running: (total.complete !== total.total)
        }
      };

      $scope.progress = progress;

      $scope.$apply();
    });

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

  });
