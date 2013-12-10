'use strict';

angular.module('app.controller', ['ngGrid', 'app.service']);

angular.module('app.controller')
  .controller('MainCtrl', function ($scope, webSocket) {
    $scope.gaugeValue = 0;

    var items = [];

    webSocket.subscribe(function (item) {
      items.push(item);

      if (items.length > 40) {
        items.shift();
      }

      $scope.chart = {
        data: items,
        max: 30
      };

      $scope.gaugeValue = item.value;
      $scope.$apply();
    });
  })
  .controller('JobGridController', function($scope, $filter, webSocket) {
    console.log('JobGridController');
    var defaultRow = {
      completed: '-',
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

    var topic = "contrib.summit.mrDebugger.jobResult";
    var msg = JSON.stringify({ "type":"subscribe", "topic": topic});

    //socket.send(msg);

    if (false) //TODO
    webSocket.on(topic, function(message) {
      var data = JSON.parse(message.data);
      var job = data.job;

      var list = [];
      var map = {
        name: 'map',
        completed: job.mapsCompleted,
        running: job.mapsRunning,
        total: job.mapsTotal,
        progress: job.mapProgress
      };
      var reduce = {
        name: 'reduce',
        completed: job.reducesCompleted,
        running: job.reducesRunning,
        total: job.reducesTotal,
        progress: job.reduceProgress
      };
      var total = {
        name: 'total',
        completed: job.mapsCompleted + job.reducesCompleted,
        running: job.mapsRunning + job.reducesRunning,
        total: job.mapsTotal + job.reducesTotal
      };
      total.progress = (total.total === 0) ? 0 : (total.completed / total.total * 100);

      list.push(createRow(map));
      list.push(createRow(reduce));
      list.push(createRow(total));

      $scope.gridData = list;
      $scope.$apply();
    });

    $scope.gridOptions = {
      data: 'gridData',
      columnDefs: [
        { field: "name", displayName: 'Task'},
        { field: "completed", displayName: 'Completed' },
        { field: "running", displayName: 'Running' },
        { field: "total", displayName: 'Total' },
        { field: "progress", displayName: 'Progress', cellFilter1: 'number:2' }
      ]
    };

  });
