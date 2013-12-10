'use strict';

describe('Controller: MainCtrl', function () {

  var mockRestService;

  // load the controller's module
  beforeEach(module('app.controller', function ($provide, webSocketProvider) {
    mockRestService = {
      getApp: jasmine.createSpy()
    };

    $provide.factory('rest', function () {
      return mockRestService;
    });

    webSocketProvider.setWebSocketObject({});
  }));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(MainCtrl).toBeDefined();
    expect(mockRestService.getApp).toHaveBeenCalled();
  });
});
