'use strict';

angular.module('app', ['ui.router', 'app.service', 'app.directive', 'app.controller', 'app.filter', 'ui.bootstrap']);

angular.module('app')
  .config(function ($stateProvider, $urlRouterProvider, webSocketProvider) {
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
        controller: 'JobCtrl'
      });
  });
