'use strict';

angular.module('nullendarApp')
.controller('CalendarFilterCtrl', function ($scope, $http, $q, socket, moment, hotkeys, eventService) {
    hotkeys.add({
        combo: 'esc',
        description: "Hide Modal",
        callback: function() {
            $scope.hideModal();
        }
    });

    $scope.isModalVisible = false;
    
    $scope.hideModal = function() {
        $scope.isModalVisible = false;
    }

    $scope.$on('openCalendarFilter', function(event) {
        $scope.isModalVisible = true;
        setTimeout(function() { // Wait for modal to be visible, otherwise focus fails
            $('#search-term').focus();
        }, 150);
    });
});
