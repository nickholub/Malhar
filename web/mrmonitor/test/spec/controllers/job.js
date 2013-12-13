'use strict';

describe('Controller: JobCtrl', function () {

  // load the controller's module
  beforeEach(module('app.controller'));

  // load the controller's module
  beforeEach(module('app.controller', function ($provide, webSocketProvider) {
    $provide.factory('$stateParams', function () {
      return {};
    });

    webSocketProvider.setWebSocketObject({});
  }));

  var JobCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    JobCtrl = $controller('JobCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(JobCtrl).toBeDefined();
  });
});
