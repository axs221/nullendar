'use strict';

angular.module('nullendarApp')
.controller('CalendarCtrl', function ($scope, $http, $q, $location, Auth, moment, hotkeys, eventService, lodash) {
  var _ = lodash;

  $scope.$on('calendarRefreshRequiredChild', function(event) {
    $scope.previousItemsPromiseData = null; // Force refresh
    $scope.setupCalendar();
  });

  $scope.$on('eventClicked', function(event, myEvent) {
    $scope.dateClicked(new moment(myEvent.date));
    $scope.selectItem(myEvent);
  });

  $scope.$on('dateClicked', function(event, date) {
    $scope.dateClicked(date);
  });

  $scope.dateClicked = function(date) {
    $scope.selectedDay = date;
    updateSelectedDayDistance();
    if ($scope.month == date.month()+1
      && $scope.year == date.year())
    {
      var firstOfMonth = new moment({ month: $scope.month - 1, year: $scope.year });
      redrawDate(date);
    }
    else
    {
      $scope.month = date.month()+1;
      $scope.year = date.year();
      $scope.setupCalendar();
    }
  }

  $scope.onDragComplete = function(item, event, date) {
    // Remove item from previous day
    for (var i = 0; i < $scope.calendarDays.length; i++) {
      var day = $scope.calendarDays[i];

      for (var j = 0; j < day.items.length; j++) {
        var itemForDay = day.items[j];

        if (itemForDay == item) {
          day.items.splice(j, 1);
          return;
        }
      };
    };
  }

  $scope.onDropComplete = function(item, event, date) {
    if (item.date === date.format('MM/DD/YY')) {
      // Open date
      $scope.selectItem(item);
    } else {
      // Update event with date
      item.date = date.format('MM/DD/YY');
      eventService.update(item._id, item);
    }

    // Add item back to new day
    for (var i = 0; i < $scope.calendarDays.length; i++) {
      var day = $scope.calendarDays[i];
        if (day.date === date) {
          day.items.push(item);
          return;
        } 
    }
  }

  $scope.createRowArray = function() {
    var rowArray = [];
    for (var i = 0; i < $scope.options.rowCount+1; i++) {
      rowArray.push(i);
    };
    return rowArray;
  }

  $scope.setupCalendar = function() {
    var firstOfMonth = new moment({ month: $scope.month - 1, year: $scope.year });

    $scope.monthName = firstOfMonth.format("MMM YYYY");
    $scope.daysInMonth = daysInMonth($scope.month, $scope.year);
    $scope.calendarDays = getCalendarDays(new moment(firstOfMonth));
  }

  var today = new moment();
  $scope.month = today.month()+1;
  $scope.year = today.year();
  $scope.selectedDay = null;
  $scope.filter = {};
  $scope.options = {};
  $scope.options.categoryOptions = eventService.categories.list;
  $scope.options.rowCount = 5;
  $scope.selectedDayDistance = null;

  $scope.setupCalendar();

  function updateSelectedDayDistance() {
    if ($scope.selectedDay === null) {
      $scope.selectedDayDistance = null;
    }

    var today = new moment();

    $scope.selectedDayDistance = $scope.selectedDay.diff(today, 'weeks') + ' weeks';
  }

  hotkeys.add({
    combo: '/',
    description: "Search",
    callback: function() {
      $scope.showEventSearchModal();
    }
  });
  hotkeys.add({
    combo: '=',
    description: "Add Row",
    callback: function() {
      $scope.options.rowCount += 1;
    }
  });
  hotkeys.add({
    combo: '-',
    description: "Remove Row",
    callback: function() {
      $scope.options.rowCount -= 1;
    }
  });
  hotkeys.add({
    combo: 'u',
    description: "Go To Today",
    callback: function() {
      $scope.currentMonth();
    }
  });
  hotkeys.add({
    combo: 'h',
    description: "Previous Year",
    callback: function() {
      $scope.previousYear();
    }
  });
  hotkeys.add({
    combo: 'l',
    description: "Next Year",
    callback: function() {
      $scope.nextYear();
    }
  });
  hotkeys.add({
    combo: 'k',
    description: "Previous Month",
    callback: function() {
      $scope.previousMonth();
    }
  });
  hotkeys.add({
    combo: 'j',
    description: "Next Month",
    callback: function() {
      $scope.nextMonth();
    }
  });
  hotkeys.add({
    combo: 'ctrl+up',
    description: "Previous Year",
    callback: function() {
      $scope.previousYear();
    }
  });
  hotkeys.add({
    combo: 'ctrl+down',
    description: "Next Year",
    callback: function() {
      $scope.nextYear();
    }
  });
  hotkeys.add({
    combo: 'left',
    description: "Previous Month",
    callback: function() {
      $scope.previousMonth();
    }
  });
  hotkeys.add({
    combo: 'right',
    description: "Next Month",
    callback: function() {
      $scope.nextMonth();
    }
  });
  hotkeys.add({
    combo: 'ctrl+left',
    description: "Previous Month",
    callback: function() {
      $scope.previousMonth();
    }
  });
  hotkeys.add({
    combo: 'ctrl+right',
    description: "Next Month",
    callback: function() {
      $scope.nextMonth();
    }
  });


  $scope.showEventSearchModal = function() {
    $scope.$broadcast('openEventSearch');
  }
  $scope.showCalendarFilterModal = function() {
    $scope.$broadcast('openCalendarFilter');
  }
  
  $scope.selectDate = function(date) {
    $scope.$broadcast('dateClicked', date);
  }

  $scope.addItemForDate = function(date) {
    $scope.$broadcast('addItemForDateClicked');
  }

  $scope.selectItem = function(itemInfo) {
    if (this.isDragging === true) {
      this.isDragging = false;
      return;
    }
    $scope.$broadcast('itemClicked', itemInfo);
  }

  $scope.currentMonth = function() {
    var today = new moment();

    $scope.month = today.month() + 1;
    $scope.year = today.year();
    $scope.setupCalendar();
    monthChanged();
  }

  $scope.nextMonth = function() {
    $scope.month += 1;
    if ($scope.month > 12)
    {
      $scope.month = 1;
      $scope.year += 1;
    }
    $scope.setupCalendar();
    monthChanged();
  }

  $scope.previousMonth = function() {
    $scope.month -= 1;
    if ($scope.month < 1)
    {
      $scope.month = 12;
      $scope.year -= 1;
    }
    $scope.setupCalendar();
    monthChanged();
  }

  $scope.nextYear = function() {
    $scope.year += 1;
    $scope.setupCalendar();
    monthChanged();
  }

  $scope.previousYear = function() {
    $scope.year -= 1;
    $scope.setupCalendar();
    monthChanged();
  }

  $scope.getItemCategoryClass = function(categoryId) {
    return 'calendar-item-category-' + categoryId;
  }


  function monthChanged() {
    var firstOfMonth = new moment({ month: $scope.month - 1, year: $scope.year });
    $scope.$broadcast('monthChanged', firstOfMonth);
  }

  function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
  }

  function getCalendarDays(firstOfMonthMoment) {
    var calendarItems;
    var calendarMonth = firstOfMonthMoment.month();

    var firstDateOnCalendar = firstOfMonthMoment.weekday(0);

    var items = [];

    for (var index = 0; index < 70; index++)
    {
      var thisDay = new moment(firstDateOnCalendar);

      items.push(
      {
        "items": [],
        "date": thisDay,
        "isInMonth": (thisDay.month() === calendarMonth ? "InMonth" : "NotInMonth"),
        "isToday": (thisDay.format("MM/DD/YY") === (new moment()).format("MM/DD/YY") ? "is-today" : ""),
        "isSelected": 
          $scope.selectedDay == null 
          ? "" 
          : (thisDay.format("MM/DD/YY") === $scope.selectedDay.format("MM/DD/YY") ? "is-selected" : "")
      });

      firstDateOnCalendar.add(1, 'days');
    }


    if ($scope.previousItemsPromiseData != null) {
      populateCalendar(items, $scope.previousItemsPromiseData);      
    } else {
      var itemsPromise = getItems();
      itemsPromise.then(function(promiseData) 
      {
        populateCalendar(items, promiseData);
      });
    }

    $scope.previousItems = items;

    return items;
  }

  function populateCalendar(days, promiseData) {
    for (var index = 0; index < 70; index++)
    {
      days[index].items = _.filter(promiseData.allItems, function(ev) { 

        var myCategoryFilter = _.find($scope.options.categoryOptions, function(categoryFilter) {
          if (ev.category == null) {
            return false;
          }
          return categoryFilter.id === ev.category;
        });

        var isCorrectDay = days[index].date.format("MM/DD/YY") === ev.date; 
        var isCorrectCategory = noCategoriesFiltered()
                                || (myCategoryFilter != null && myCategoryFilter.checked);

        return isCorrectDay && isCorrectCategory;
      });
    }
    $scope.previousItemsPromiseData = promiseData;
  }

  function noCategoriesFiltered () {
    return !_.any($scope.options.categoryOptions, 'checked');
  }

  function refilterCalendar() {
    var promiseData = $scope.previousItemsPromiseData 
    for (var index = 0; index < 35; index++)
    {
      days[index].items = _.filter(promiseData.allItems, function(ev) { 
        var isCorrectDay = days[index].date.format("MM/DD/YY") === ev.date; 
        var isCorrectCategory = $scope.options.categorySelected === ev.category;
      });
    }
  }

  function redrawDate(date) {
    for (var index = 0; index < 40; index++)
    {
      var thisDay = $scope.calendarDays[index];
      if (thisDay.date.format("MM/DD/YY") === new moment(date).format("MM/DD/YY"))
      {
        $scope.calendarDays[index].isSelected = "is-selected";
      }
      else {
        $scope.calendarDays[index].isSelected = "";
      }
    }
  }


  function compare(a,b) {
    if (a.date < b.date)
       return -1;
    if (a.date> b.date)
      return 1;
    return 0;
  }

  function getItems() {
    var myPromise = $q.defer();

    var eventPromise = eventService.getAll();
    eventPromise.success(function(calendarDays) {
      var events = [];

      for (var x = 0; x < calendarDays.length; x++) {
        events.push(calendarDays[x]);
      }
        
      myPromise.resolve({"allItems": events});
    });

    return myPromise.promise;
  }



});

