'use strict';

angular.module('nullendarApp')
.controller('EventCreationCtrl', function ($scope, $http, socket, moment, hotkeys, eventService, lodash) {

    var Event = function() {
        this.isNew = true;
        this.date = (new moment()).format("MM/DD/YY");
        this.title = null;
        this.description = null;
        this.recurringAmount = 1;
        this.selectedRecurringOption = 'days';
        this.recurringInstances = 1;
        this.shouldAutoCreateIssueBeforeSprint = false;
        this.priorDaysToSendReminderEmails = [];
        this.project = "JiraSyncTest";
        this.category = "general";
        this.jiraProjectOptions = [];
    }


    var _ = lodash;

    hotkeys.add({
        combo: 'esc',
        description: "Hide Event Creation Modal",
        callback: function() {
            $scope.hideEventCreationModal();
        }
    });

    $scope.auto = "";

    hotkeys.add({
        combo: 'n',
        description: null,
        callback: function() {
            addItemForDateClicked();
        }
    });

    $scope.$on('dateClicked', function(event, date) {
        $('#event-title').focus();
        $scope.event.date = date.format("MM/DD/YY");
    });

    $scope.$on('monthChanged', function(event, month) {
        $scope.event.date = month.format("MM/DD/YY");
    });

    $scope.isModalVisible = false;
    $scope.event = new Event();
    $scope.options = {};
    $scope.recurringOptions = 
    [
        'days',
        'weeks',
        'months',
        'years'
    ];

    initializeJiraProjectOptions();
    initializeCategoryOptions();

    $scope.inputKeyDown = function(event) {
        if (event.keyCode === 27) { // Escape
            $scope.hideEventCreationModal();
        }
    }

    $scope.addDayToSendReminderEmail = function() {
        $scope.event.priorDaysToSendReminderEmails.push({ "days": getNextDateToAdd() });
    }

    $scope.removeDayToSendReminderEmail = function(indexToRemove) {
        $scope.event.priorDaysToSendReminderEmails.splice(indexToRemove, 1);
    }

    function getNextDateToAdd () {
        var maxValue = 0;
        for (var i = 0; i < $scope.event.priorDaysToSendReminderEmails.length; i++) {
            var value = $scope.event.priorDaysToSendReminderEmails[i].days

            if (value > maxValue) {
                maxValue = value;
            }
        };
        return maxValue+1;
    }

    $scope.$on('itemClicked', function(event, itemInfo) {
        $scope.event = itemInfo;

        $scope.event.categoryObj = eventService.categories.getById(itemInfo.category);

        $scope.showEventCreationModal();
    });

    $scope.$on('addItemForDateClicked', function(event, itemInfo) {
        addItemForDateClicked();
    });

    function addItemForDateClicked() {
        $scope.event = new Event();
        $scope.showEventCreationModal();
    }

    $scope.showEventCreationModal = function() {
        initializeJiraProjectOptions();
        $scope.isModalVisible = true;
        setTimeout(function() { // Wait for modal to be visible, otherwise focus fails
            $('#event-title').focus();
        }, 100);
    }

    $scope.hideEventCreationModal = function() {
        $scope.isModalVisible = false;
    }

    $scope.openCalendar = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
    
        $scope.options.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.format = 'shortDate';

    $scope.addEvent = function(callback) {
        if($scope.event.title === '' || $scope.event.title === null) {
            return;
        }

        var currentDate = new moment($scope.event.date);
        var shouldAutoCreateIssue = $scope.event.shouldAutoCreateIssueBeforeSprint;

        for (var x = 0; x < $scope.event.recurringInstances; x++) {
            var newItem = createItemToSave();
            newItem.issue = null;

            // Don't create multiple issues for an event that spans multiple days in a row
            if (x > 0 && $scope.event.selectedRecurringOption === 'days') {
                newItem.shouldAutoCreateIssueBeforeSprint = false;
            }
            var currentDateText = new moment(currentDate).format("MM/DD/YY");
            newItem.date = currentDateText;

            eventService.create(newItem, callback);

            currentDate.add($scope.event.recurringAmount, $scope.event.selectedRecurringOption);
        }

        $scope.event.title = '';
        $scope.event.description = '';
        $scope.isModalVisible = false;
        $scope.$emit('calendarRefreshRequired');
    };

    $scope.createIssueForEvent = function() {
        if ($scope.event.issue == null || $scope.event.issue === "") {
            eventService.createIssue($scope.event._id, function(promise) {
                $scope.event = null;
                $scope.isModalVisible = false;
                $scope.$emit('calendarRefreshRequired');
            });
        } else {
            console.log("Event has no issue assigned, event: " + $scope.event.description);
        }
    }

    $scope.openIssueForEvent = function() {
        if ($scope.event.issue == null || $scope.event.issue === "") {
            console.log("Event already has issue assigned, issue: " + $scope.event.issue);
        } else {
            var url = "https://inindca.atlassian.net/browse/" + $scope.event.issue;
            var win = window.open(url, '_blank');
            win.focus();
        }

        setTimeout(function() { // Wait for Jira query to finish
            $scope.event = null;
            $scope.isModalVisible = false;
            $scope.$emit('calendarRefreshRequired');
        }, 1500);
    }

    $scope.hasJiraIssue = function() {
        return ($scope.event != null && $scope.event.issue != null && $scope.event.issue !== "");
    }

    $scope.updateEvent = function() {
        if($scope.event.title === '') {
            return;
        }
        var item = createItemToSave();

        eventService.update($scope.event._id, item);

        $scope.event = null;
        $scope.isModalVisible = false;
        $scope.$emit('calendarRefreshRequired');
    };

    function createItemToSave () {
        return { 
            date: new moment($scope.event.date).format("MM/DD/YY"),
            title: $scope.event.title,
            description: $scope.event.description,
            issue: $scope.event.issue,
            project: $scope.event.project,
            category: $scope.event.categoryObj.id,
            shouldAutoCreateIssueBeforeSprint: $scope.event.shouldAutoCreateIssueBeforeSprint,
            priorDaysToSendReminderEmails: $scope.event.priorDaysToSendReminderEmails
        };
    }

    $scope.deleteEvent = function() {
        eventService.delete($scope.event._id);

        $scope.$emit('calendarRefreshRequired');
        $scope.event = null;
        $scope.isModalVisible = false;
    };

    $scope.cancelUpdate = function() {
        $scope.event = null;
    }

    function initializeJiraProjectOptions() {
        var promise = eventService.initializeJiraProjectOptions();
        
        promise.then(function(projectNames) {
            $scope.event.jiraProjectOptions = projectNames;
        });
    }

    function initializeCategoryOptions() {
        $scope.options.categoryOptions = eventService.categories;
    }

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('event');
    });

});
