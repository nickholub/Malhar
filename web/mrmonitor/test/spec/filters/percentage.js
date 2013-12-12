'use strict';

describe('Filter: percentage', function () {

  // load the filter's module
  beforeEach(module('app.filter'));

  // initialize a new instance of the filter before each test
  var percentage;
  beforeEach(inject(function ($filter) {
    percentage = $filter('percentage');
  }));

  it('should return percentage', function () {
    var number = '50.12345';
    expect(percentage(number)).toBe('50.12%');
  });

});
