'use strict';

angular.module('app.controller')
  .controller('MainCtrl', function ($scope, $stateParams, webSocket, rest, util) {
    if ($stateParams.jobId) {
      $scope.activeJobId = util.extractJobId($stateParams.jobId);
    } else {
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
    }

    webSocket.subscribe(settings.topic.job, function (message) {
      var data = JSON.parse(message);
      $scope.job = data.job;
      $scope.$apply();
    });
  })
  .controller('MonitoredJobGridController', function ($scope) {
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

    var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text><a href="#/jobs/{{COL_FIELD}}">{{COL_FIELD}}</a></span></div>';

    $scope.gridOptions = {
      data: 'gridData',
      enableRowSelection: false,
      columnDefs: [
        { field: 'id', displayName: 'Id', width: 200, cellTemplate: linkTemplate },
        { field: 'name', displayName: 'Name'},
        { field: 'state', displayName: 'State' },
        { field: 'mapProgress', displayName: 'Map Progress', cellFilter: 'percentage' },
        { field: 'reduceProgress', displayName: 'Reduce Progress', cellFilter: 'percentage' }
      ]
    };
  });

