/**
  * Interact with the Jira REST API
  */

  'use strict';

  var _ = require('lodash');
  var request = require('request');
  var qs = require('querystring');
  var process = require('child_process');
  var Events = require('../../api/event/event.model');
  var moment = require('moment');
  var jiraref = require('jira');

  var config = require('../../config/environment');
  var crypto = require('crypto');

  function decrypt(text){
    var decipher = crypto.createDecipher('aes-256-cbc','d2F3Efeq')
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
  }

  exports.createJiraIssue = function(event, callback) {
    if (event.issue != null 
      && event.issue !== "")
    {
      if (callback) { callback(event); }
      return;
    }

    var username = config.jira.username;
    var password = decrypt(config.jira.password);
    var jira = new jiraref.JiraApi('https', "inindca.atlassian.net", "443", username, password, "2");

    jira.getProject(event.project, function(err, project) {
      if (project == null) {
          project = { "id": "13100" }; // Fall back to JiraSyncTest
        }

        var issue = 
        {
          "fields": {
            "project": {
              "id": project.id
            },
            "summary": event.title,
            "issuetype": {
              "id": "7",
              "description": event.description
            }
          }
        };

        jira.addNewIssue(issue, function(error, newIssue) {
          event.issue = newIssue.key;
          Events.updateEvent(event);

          if (callback) { callback(event); }
        });
      });
  }


  exports.execute = function() {
    console.log("Checking to create Jira issues for events");
    checkForNewEventsThatNeedIssues();
  }

  function checkForNewEventsThatNeedIssues () {
    console.log("Checking for upcoming events to add to Jira");
    Events.find({ "issue" : null, "shouldAutoCreateIssueBeforeSprint" : true }, function(err, events) {
      var sprintLength = 3;
      var oneSprintAway = (new moment()).add(sprintLength, 'weeks');

      for (var x = 0; x < events.length; x++) {
        var event = events[x];
        if (event.issue === null || event.issue === '') {
          var eventDate = new moment(event.date);
          if (eventDate < oneSprintAway) {
            exports.createJiraIssue(event);
          }
        }
      }
    });
  }

