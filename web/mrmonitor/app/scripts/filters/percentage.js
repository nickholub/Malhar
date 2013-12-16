'use strict';

angular.module('app.filter')
  .filter('percentage', function ($filter) {
    var numberFilter = $filter('number');

    return function (input) {
      if (input) {
        return numberFilter(input, 2) + '%';
      } else {
        return null;
      }
    };
  });
