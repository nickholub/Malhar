/*global angular, jQuery*/
(function () {
'use strict';

angular.module('socket', []).factory('socket', function() {
    var ws = new WebSocket(settings.webSocketUrl);

    //TODO use AngularJS promise instead
    var dfd = new jQuery.Deferred();
    var topicMap = {}; // topic -> [callbacks] mapping
    var bufferCallbacks = jQuery.Callbacks();

    ws.onopen = function () {
        dfd.resolve();
    };

    ws.onerror = function (error) {
        //TODO error handling
    };

    var useBuffer = false; //TODO
    var delay = 1000;
    var buffer = {};

    function notifySubscribers() {
        bufferCallbacks.fire(buffer, delay);

        // notify
        jQuery.each(buffer, function(topic, messages) {
            var callbacks = topicMap[topic];
            var lastMessage = messages[messages.length - 1];
            callbacks.fire(lastMessage, messages);
        });
        buffer = {} ; // clear buffer

        _.delay(notifySubscribers, delay);
    }

    notifySubscribers();

    ws.onmessage = function (e) {
        var data = JSON.parse(e.data);
        //console.log(data);
        var topic = data.topic;

        if (useBuffer) { // use buffer
            var messages = buffer[topic];
            if (_.isUndefined(messages)) {
                messages = [];
                buffer[topic] = messages;
            }
            messages.push(data);
        } else { // do not use buffer
            if (topicMap.hasOwnProperty(topic)) {
                topicMap[topic].fire(data);
            }
        }
    };

    return {
        // for testing only
        message: function(topic, data) {
            var callbacks = topicMap[topic];
            callbacks.fire({ data: data });
        },

        send: function(message) {
            var msg = JSON.stringify(message);
            console.log('send ' + msg);

            if (dfd.state() === 'resolved') {
                ws.send(msg);
            } else {
                dfd.done(function() {
                    ws.send(msg);
                });
            }
        },

        onbuffer: function(callback) {
            bufferCallbacks.add(callback);
        },

        subscribe: function (topic, callback) {
            var callbacks = topicMap[topic];
            if (!callbacks) {
                var message = { "type":"subscribe", "topic": topic };
                this.send(message); // subscribe message

                callbacks = jQuery.Callbacks();
                topicMap[topic] = callbacks;
            }
            callbacks.add(callback);
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