'use strict';

angular.module('app', ['app.service', 'app.directive', 'app.controller']);

angular.module('app')
  .config(function ($routeProvider, webSocketProvider) {
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
