/*global angular, jQuery*/
(function () {
'use strict';

angular.module('app').factory('socket', function() {
    var webSocketUrl = 'ws://node0.morado.com:9090/pubsub';
    var ws = new WebSocket(webSocketUrl);

    //TODO use AngularJS promise instead
    var dfd = new jQuery.Deferred();
    var topicMap = {}; // topic -> [callbacks] mapping
    var callbacks = jQuery.Callbacks();

    ws.onopen = function () {
        dfd.resolve();
    };

    ws.onerror = function (error) {
        //TODO
        //console.log('WebSocket Error ' + error);
    };

    var once = true;

    ws.onmessage = function (e) {
        var data = JSON.parse(e.data);
        var topic = data.topic;
        var callbacks = topicMap[topic];
        callbacks.fire(data);
    };

    return {
        send: function(msg) {
            console.log('send ' + msg);
            if (dfd.state() === 'resolved') {
                ws.send(msg);
            } else {
                dfd.done(function() {
                    ws.send(msg);
                });
            }
        },

        on: function(topic, callback) {
            var callbacks = topicMap[topic];
            if (!callbacks) {
                callbacks = jQuery.Callbacks();
                topicMap[topic] = callbacks;
            }
            callbacks.add(callback);
        }
    };
});

})();