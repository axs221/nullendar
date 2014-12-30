/* global io */
'use strict';

angular.module('nullendarApp')
  .factory('eventService', function($http, $q, lodash) {
    var _ = lodash; 

    var Category = function(id, name) {
      this.id = id;
      this.name = name;
    }

    var Categories = function(categoryList) {
      this.list = categoryList;
    }

    Categories.prototype.getBy = function(propertyName, propertyValue) {
      for (var i = 0; i < this.list.length; i++) {
        var category = this.list[i]
        if (category[propertyName] === propertyValue) {
          return category;
        }
      };
    }

    Categories.prototype.getById = function(id) {
      return this.getBy("id", id);
    }

    Categories.prototype.getByName = function(name) {
      return this.getBy("name", name);
    }

    var EventService = function() {
      this.lastRetrievedEvents = null;

      this.categories = new Categories([
        new Category("general","General Event"),
        new Category("holidays","Holidays"),
        new Category("mainproductrelease","CIC/PureCloud Release"),
        new Category("projectdeadline","Project Deadline"),
        new Category("3rdpartychange", "3rd Party Change")
      ]); 
    }

    EventService.prototype.get = function(id) {
      var response = $http({
        url: '/api/events/' + id, 
        method: "GET",
      });
      return response;
    }

    EventService.prototype.getOnDate = function(date) {
      return $http({
        url: '/api/events', 
        method: "GET",
        params: { "date" : date }
      });
    }

    EventService.prototype.getAll = function(date) {
      return $http({
        url: '/api/events', 
        method: "GET"
      });
    }

    // TODO - may be able to just use getAll
    EventService.prototype.getAllPrivate = function() {
        var myService = this;
        var myPromise = $q.defer();
        var result = $http({
          url: '/api/events', 
          method: "GET"
          // params: { "date" : "2014-10-12T04:00:00.000Z" }
          // params: { "date" : day.format("MM/DD/YY") }
          });

        result.success(
              function(calendarDays) {
              var events = [];

              for (var x = 0; x < calendarDays.length; x++)
              {
                events.push(calendarDays[x]);
              }

              myService.lastRetrievedEvents = events;

              myPromise.resolve(events);
        });

      return myPromise.promise;
    }

    EventService.prototype.initializeJiraProjectOptions = function() {
      var myPromise = $q.defer();

      setTimeout(function() {
        var promise = EventService.prototype.getAllPrivate();
        promise.then(function(events) {
          var projectNames = [];
          for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (event.project != null && !_.contains(projectNames, event.project)) {
              projectNames.push(event.project);
            }
          };
          myPromise.resolve(projectNames);
        })
      }, 200);

      return myPromise.promise;
    }

    EventService.prototype.search = function(searchTerm) {
        var calendarItems;

        var itemsForDayPromise = this.getAll();

        var items = [];

        itemsForDayPromise.then(function(promise) 
        {
          for (var x = 0; x < promise.data.length; x++)
          {
              var item = promise.data[x];
              if ((item.title == "" || item.title == null)
                  || item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
              {
                  items.push(item);
              }
          }
        });

        return items;
    }

    EventService.prototype.create = function(newEvent) {
      $http.post('/api/events', 
          newEvent);
    }   

    EventService.prototype.createIssue = function(id, callback) {
      var self = this;

      this.get(id)
          .then(function(promise) {
            $http.post('/api/events/' + id + '/createissue', promise.data)
                 .then(function(data, status, headers, config) {
                    self.update(id, data, callback);
                  });
          });
    }

    EventService.prototype.update = function(id, event, callback) {
      if (!callback) callback = function(){};

      $http.put('/api/events/' + id, event)
           .then(callback);
    }

    EventService.prototype.delete = function(id) {
      $http.delete('/api/events/' + id);
    }

    EventService.prototype.deleteAll = function(events) {
        for (var x = 0; x < events.length; x++) {
            $http.delete('/api/events/' + events[x]._id);
        }
    }

    var eventService = new EventService();

    return eventService;
});