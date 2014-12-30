'use strict';

var _ = require('lodash');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
  title: String,
  description: String,
  date: String, //TODO: date
  issue: String, // JIRA issue
  project: String, // JIRA project to create issue for
  category: String, // Category...
  shouldAutoCreateIssueBeforeSprint: Boolean,
  priorDaysToSendReminderEmails: [{ days: Number }], 
  info: String,
  active: Boolean
});

var model = mongoose.model('Event', EventSchema);

model.updateEvent = function(event) {
  this.findById(event._id, function (err, existingEvent) {
    if(!existingEvent) { console.log("No existing event, id: " + event._id); }
    // Yeoman used _.merge instead. I changed to _.assign. Using _.merge() has problems if the object has a property that is an array, and you are removing items from the array. It merges the values together, doing a union, so the old value isn't removed.
    var updated = _.assign(existingEvent, event); 
    updated.markModified("priorDaysToSendReminderEmails");

    updated.save(function (err, product, numberAffected) {
    });
  })
};

module.exports = model;