'use strict';

describe('Controller: AppListCtrl', function () {

  // load the controller's module
  beforeEach(module('app.controller'));

  var AppListCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AppListCtrl = $controller('AppListCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    //TODO
    //expect(scope.awesomeThings.length).toBe(3);
  });
});
