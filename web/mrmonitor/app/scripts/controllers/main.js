'use strict';

angular.module('app.controller')
  .controller('MainCtrl', function ($scope, $stateParams, webSocket, rest, util, settings) {

    function queryApp(id) {
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

    if (false)
    rest.getApp('word count').then(function (app) {
      if (app && app.id) {
        $scope.app = app;

        var id = util.extractJobId(app.id);
        $scope.activeJobId = id;
        //queryApp(id);
      }
    });

    $scope.$on('activeJobId', function (event, activeJobId) {
      if (activeJobId) {
        $scope.activeJobId = activeJobId;
        queryApp(activeJobId);
      }
    });

    webSocket.subscribe(settings.topic.stats, function (message) {
      var data = JSON.parse(message);
      window.a = data;
      console.log(data);
    });

    webSocket.subscribe(settings.topic.job, function (message) {
      var data = JSON.parse(message);
      $scope.job = data.job;
      //console.log(data.job);

      var jobId = util.extractJobId($scope.job.id);
      //console.log(jobId + ' ' + $scope.activeJobId);

      if ($scope.activeJobId === jobId) {
        $scope.activeJob = $scope.job;
        //console.log('assigned');
      }

      $scope.$apply();
    }, $scope);
  })
  .controller('MonitoredJobGridController', function ($scope, util, $templateCache) {
    var jobs = {};

    $scope.$watch('job', function (job) {
      if (!job) {
        return;
      }

      jobs[job.id] = job;
      var list = _.map(_.values(jobs), function (job) {
        var jobId = util.extractJobId(job.id);

        return {
          id: job.id,
          name: job.name,
          cellRowClass: ($scope.activeJobId === jobId) ? 'row-active': '',
          state: job.state,
          mapProgress: job.mapProgress,
          reduceProgress: job.reduceProgress
        };
      });
      $scope.gridData = list;
    });

    var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text><a href="#/jobs/{{COL_FIELD}}">{{COL_FIELD}}</a></span></div>';

    var rowTemplate = $templateCache.get('rowTemplate.html');
    rowTemplate = rowTemplate.replace('ngCell', 'ngCell {{row.entity.cellRowClass}}'); // custom row class

    //TODO
    //var actionCellTemplate = $templateCache.get('cellTemplate.html');
    //actionCellTemplate = actionCellTemplate.replace('{{COL_FIELD CUSTOM_FILTERS}}', '<i class="icon-trash"></i>');
    var actionCellTemplate = '<div class=\"ngCellText\" ng-class=\"col.colIndex()\"><i class="icon-trash"></i></div>';

    $scope.gridOptions = {
      data: 'gridData',
      rowTemplate: rowTemplate,
      enableRowSelection: false,
      columnDefs: [
        { field: 'id', displayName: 'Id', width: 200, cellTemplate: linkTemplate },
        { field: 'name', displayName: 'Name'},
        { field: 'state', displayName: 'State' },
        { field: 'mapProgress', displayName: 'Map Progress', cellFilter: 'percentage' },
        { field: 'reduceProgress', displayName: 'Reduce Progress', cellFilter: 'percentage' },
        { field: 'id', displayName: ' ', cellTemplate: actionCellTemplate, cellClass: 'remove', width: '40px' }
      ]
    };
  });

