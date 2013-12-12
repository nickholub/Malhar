'use strict';

angular.module('app.filter', []);

angular.module('app.filter')
  .filter('percentage', function ($filter) {
    var numberFilter = $filter('number');

    return function (input) {
      return numberFilter(input, 2) + '%';
    };
  });
