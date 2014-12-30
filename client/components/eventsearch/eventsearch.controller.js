'use strict';

angular.module('nullendarApp')
.controller('EventSearchCtrl', function ($scope, $http, $q, socket, moment, hotkeys, eventService) {
    hotkeys.add({
        combo: 'esc',
        description: "Hide Event Search Modal",
        callback: function() {
            $scope.hideModal();
        }
    });

    $scope.inputKeyDown = function(event) {
        if (event.keyCode === 27) { // Escape
            $scope.hideModal();
        }
    }

    $scope.searchTerm = "";
    $scope.lastSearchTerm = "";
    $scope.isModalVisible = false;

    $scope.$on('openEventSearch', function(event) {
        $scope.isModalVisible = true;
        setTimeout(function() { // Wait for modal to be visible, otherwise focus fails
            $('#search-term').focus();
        }, 150);
    });

    $scope.getSearchResults = function() {
        var firstOfMonth = new moment({ month: $scope.month - 1, year: $scope.year });

        $scope.searchResults = eventService.search($scope.searchTerm);
        $scope.lastSearchTerm = $scope.searchTerm;

        setTimeout(function() { // Wait for modal to be visible, otherwise focus fails
            $('#search-results a:first').focus();
        }, 100);
    }

    $scope.hideModal = function() {
        $scope.isModalVisible = false;
    }

    $scope.goToEvent = function(event) {
        $scope.$emit('eventClicked', event);

        $scope.isModalVisible = false; 
    }

    $scope.deleteAllResults = function() {
        if (confirm('Are you sure you want to delete all events found in the search results?')) {
            eventService.deleteAll($scope.searchResults);
            $scope.$emit('calendarRefreshRequired');
            $scope.searchResults = [];
        }
    };
});
