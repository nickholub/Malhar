'use strict';

angular.module('app', ['app.service', 'app.controller']);

angular.module('app')
  .config(function ($routeProvider, webSocketProvider) {
    webSocketProvider.setWebSocketURL('ws://' + window.location.host + '/sockjs/websocket');

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
