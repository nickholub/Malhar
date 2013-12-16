'use strict';

angular.module('app.controller')
  .controller('AppListCtrl', function ($scope, rest) {
    rest.getApps().then(function (apps) {
      $scope.items = apps;
    });
  });