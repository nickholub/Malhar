'use strict';

describe('Service: Util', function () {

  // load the service's module
  beforeEach(module('app.service'));

  // instantiate service
  var util;
  beforeEach(inject(function (_util_) {
    util = _util_;
  }));

  it('should extract id from application', function () {
    expect(util.extractJobId('application_1385061413075_0824')).toEqual('1385061413075_0824');
  });

  it('should extract id from job', function () {
    expect(util.extractJobId('job_1385061413075_0780')).toEqual('1385061413075_0780');
  });

});
