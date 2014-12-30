'use strict';

angular.module('nullendarApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
   
    $scope.$on('dateClicked', function(event, date) {
      $scope.$broadcast('dateClickedChild', date);
    });

    $scope.$on('itemClicked', function(event, itemInfo) {
      $scope.$broadcast('itemClickedChild', itemInfo);
    });

    $scope.$on('calendarRefreshRequired', function(event) {
      $scope.$broadcast('calendarRefreshRequiredChild');
    });

  });
