'use strict';

angular.module('app', ['ui.router', 'app.service', 'app.directive', 'app.controller', 'app.filter', 'ui.bootstrap']);

angular.module('app')
  .config(function ($stateProvider, $urlRouterProvider, webSocketProvider) {
    //TODO
    //webSocketProvider.setWebSocketURL('ws://' + window.location.host + '/sockjs/websocket');
    webSocketProvider.setWebSocketURL(settings.webSocketURL);

    $urlRouterProvider.otherwise('/jobs/');

    $stateProvider
      .state('jobs', {
        url: '/jobs',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .state('jobs.job', {
        url: '/:jobId',
        templateUrl: 'views/job.html',
        controller: 'JobController'
        /*
        controller: function ($scope, $stateParams) {
          console.log('nested view');
          console.log($stateParams);
          $scope.things = [$stateParams.jobId, "Set", "Of", "Things"];
        }
        */
      });
  });
