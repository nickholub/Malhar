'use strict';

angular.module('app.service')
  .service('util', function () {
    return {
      extractJobId: function (value) {
        if (!value) {
          return value;
        }

        return value.match(/\d.*/)[0];
      }
    };
  });
