'use strict';

describe('Service: rest', function () {

  // load the service's module
  beforeEach(module('app.service'));

  // instantiate service
  var rest;
  beforeEach(inject(function (_rest_) {
    rest = _rest_;
  }));

  it('should be defined', function () {
    expect(!!rest).toBe(true);
  });

});
