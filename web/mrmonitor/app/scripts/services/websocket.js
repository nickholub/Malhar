'use strict';

angular.module('app.service', ['ng']);

angular.module('app.service')
  .provider('webSocket', function () {

    var webSocketURL;
    var webSocketObject; // for testing only

    return {
      $get: function ($q,  $rootScope) {
        if (!webSocketURL && !webSocketObject) {
          throw 'WebSocket URL is not defined';
        }

        var socket = !webSocketObject ? new WebSocket(webSocketURL) : webSocketObject;

        var deferred = $q.defer();

        socket.onopen = function () {
          deferred.resolve();
          $rootScope.$apply();
        };

        var callbacks = jQuery.Callbacks();
        var topicMap = {}; // topic -> [callbacks] mapping

        socket.onmessage = function (event) {
          //console.log(event);
          var message = JSON.parse(event.data);
          //console.log(message);

          var topic = message.topic;

          if (topicMap.hasOwnProperty(topic)) {
            topicMap[topic].fire(message.data);
          }
        };

        return {
          send: function (message) {
            var msg = JSON.stringify(message);

            deferred.promise.then(function () {
              socket.send(msg);
            });
          },

          subscribe: function (topic, callback) {
            var callbacks = topicMap[topic];

            if (!callbacks) {
              var message = { type: "subscribe", topic: topic };
              this.send(message); // subscribe message

              callbacks = jQuery.Callbacks();
              topicMap[topic] = callbacks;
            }

            callbacks.add(callback);
          }
        };
      },

      setWebSocketURL: function (wsURL) {
        webSocketURL = wsURL;
      },

      setWebSocketObject: function (wsObject) {
        webSocketObject = wsObject;
      }
    };
  });
