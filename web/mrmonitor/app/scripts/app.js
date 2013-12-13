'use strict';

angular.module('app', ['ui.router', 'app.service', 'app.directive', 'app.controller', 'app.filter', 'ui.bootstrap']);

angular.module('app')
  .config(function ($stateProvider, $urlRouterProvider, webSocketProvider) {
    //TODO
    //webSocketProvider.setWebSocketURL('ws://' + window.location.host + '/sockjs/websocket');
    webSocketProvider.setWebSocketURL(settings.webSocketURL);

    $urlRouterProvider.otherwise('/main');

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      });
  });
