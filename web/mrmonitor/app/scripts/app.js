'use strict';

angular.module('app', ['ngRoute', 'app.service', 'app.directive', 'app.controller', 'ui.bootstrap']);

angular.module('app')
  .config(function ($routeProvider, webSocketProvider) {
    //TODO
    //webSocketProvider.setWebSocketURL('ws://' + window.location.host + '/sockjs/websocket');
    webSocketProvider.setWebSocketURL(settings.webSocketURL);

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
