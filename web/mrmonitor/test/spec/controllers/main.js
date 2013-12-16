'use strict';

describe('Controller: MainCtrl', function () {

  var mockRestService;

  // load the controller's module
  beforeEach(module('app.controller', function ($provide, webSocketProvider) {
    mockRestService = {
      getApp: function () {}
    };

    $provide.constant('settings', { topic: {} });

    $provide.factory('rest', function () {
      return mockRestService;
    });

    $provide.factory('$stateParams', function () {
      return {};
    });

    webSocketProvider.setWebSocketObject({});
  }));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $q, $rootScope) {
    scope = $rootScope.$new();

    var deferred = $q.defer();
    var promise = deferred.promise;

    spyOn(mockRestService, 'getApp').andReturn(promise);

    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should be defined', function () {
    expect(MainCtrl).toBeDefined();
    //TODO
    //expect(mockRestService.getApp).toHaveBeenCalled();
  });
});
