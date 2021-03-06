/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /events              ->  index
 * POST    /events              ->  create
 * GET     /events/:id          ->  show
 * PUT     /events/:id          ->  update
 * DELETE  /events/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Event = require('./event.model');
var http = require('http');
var jira = require('../../components/jira/jira');

// // Get list of events
// exports.index = function(req, res) {
//   Event.find(function (err, events) {
//     if(err) { return handleError(res, err); }
//     return res.json(200, events);
//   });
// };
// Get list of events
exports.index = function(req, res) {
  Event.find(req.query, function (err, events) {
    if(err) { return handleError(res, err); }
    return res.json(200, events);
  });
};

// Get a single event
exports.show = function(req, res) {
  Event.findById(req.params.id, function (err, event) {
    if(err) { return handleError(res, err); }
    if(!event) { return res.send(404); }
    return res.json(event);
  });
};

// Creates a new event in the DB.
exports.create = function(req, res) {
  console.log(req.body);
  Event.create(req.body, function(err, event) {
    if(err) { 
      return handleError(res, err); 
    }
    return res.json(201, event);
  });
};

// Creates a Jira issue based on an event.
exports.createIssue = function(req, res) {
  jira.createJiraIssue(req.body, function(event) {
    return res.send(201, event);
  });
}

// Updates an existing event in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Event.findById(req.params.id, function (err, event) {
    if (err) { return handleError(res, err); }
    if(!event) { return res.send(404); }
    var updated = _.merge(event, req.body);

    // This doesn't merge correctly, so just update it to be equal to what was requested.
    updated.priorDaysToSendReminderEmails = req.body.priorDaysToSendReminderEmails;
    updated.markModified("priorDaysToSendReminderEmails");
    
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, event);
    });
  });
};

// Deletes a event from the DB.
exports.destroy = function(req, res) {
  Event.findById(req.params.id, function (err, event) {
    if(err) { return handleError(res, err); }
    if(!event) { return res.send(404); }
    event.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}