var ical = require('ical-generator');
var http = require('http');
var cal = ical();
var Events = require('../../api/event/event.model');

cal.setDomain('inin.com').setName('nullendar');

http.createServer(function(req, res) {
    cal.serve(res);
}).listen(9001, '127.0.0.1');
console.log('ical server running at http://127.0.0.1:9001/');

function checkForNewEventsThatNeedReminders () {
  cal.clear();

  Events.find(function(err, events) {
    for (var x = 0; x < events.length; x++) {
        var event = events[x];
        var eventDate = new Date(event.date);
        var nextDay = new Date((new Date(event.date)).setDate((new Date(event.date)).getDate() + 1));
        

        cal.addEvent({
            start: eventDate,
            end: nextDay,
            allDay: true,
            summary: event.title,
            description: event.description,
        });
    }
  });
}

exports.execute = function() {
    console.log("Refreshing events in ICS file");
    checkForNewEventsThatNeedReminders();
}

exports.sendIcsInResponse = function(res) {
  cal.serve(res);
}