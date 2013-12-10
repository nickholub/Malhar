'use strict';

describe('Service: webSocket', function () {

  var webSocketObject;
  var webSocket;

  beforeEach(module('app.service', function(webSocketProvider) {
    webSocketObject = {
      send: function () {}
    };

    webSocketProvider.setWebSocketObject(webSocketObject);
  }));

  beforeEach(inject(function (_webSocket_) {
    webSocket = _webSocket_;
  }));

  it('should notify subscribers', function () {
    expect(webSocketObject.onmessage).toBeDefined();

    var listener1 = jasmine.createSpy();
    var listener2 = jasmine.createSpy();

    webSocket.subscribe('topic1', listener1);
    webSocket.subscribe('topic2', listener2);

    var msg1 = JSON.stringify({ topic: 'topic1', data: { value: 100 } });
    var msg2 = JSON.stringify({ topic: 'topic2', data: { value: 50 } });

    webSocketObject.onmessage({ data: msg1 });
    expect(listener1).toHaveBeenCalled();

    webSocketObject.onmessage({ data: msg2 });
    expect(listener2).toHaveBeenCalled();
  });

  it('should send message when WebSocket connection is opened', inject(function ($rootScope) {
    expect(webSocketObject.onopen).toBeDefined();

    spyOn(webSocketObject, 'send');

    webSocket.send({ value: 100 });

    expect(webSocketObject.send).not.toHaveBeenCalled(); // no connection yet

    webSocketObject.onopen();

    expect(webSocketObject.send).toHaveBeenCalled();
  }));

});
