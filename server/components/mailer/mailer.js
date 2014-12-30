var nodemailer = require('nodemailer');
var Events = require('../../api/event/event.model');
var moment = require('moment');
var _ = require('lodash');

exports.startTimerForMailerReminders = function() {
  console.log("Starting Mailer timer!");
  checkForNewEventsThatNeedReminders();
}

exports.execute = function() {
    console.log("Checking to send reminders for events");
    checkForNewEventsThatNeedReminders();
}

function checkForNewEventsThatNeedReminders () {
  Events.find(function(err, events) {
    var now = new moment();
    var today = new moment(now.format("MM/DD/YY"));
    var sprintLength = 3;
    var oneSprintAway = (new moment()).add(sprintLength, 'weeks');

    for (var x = 0; x < events.length; x++) {
          var event = events[x];
        var eventDate = new moment(event.date);
        if (eventDate < oneSprintAway) {
            var distance = eventDate.diff(today, 'days')
            if (event.priorDaysToSendReminderEmails != null
                    && _.contains(event.priorDaysToSendReminderEmails, distance)) {
                exports.sendEmail("Shawn.Axsom@inin.com", "Calendar Event Reminder: " + event.title, event.description + "\r\n\r\n" + "<a href='http://localhost:9000'>Go to nullendar</a>");
                _.pull(event.priorDaysToSendReminderEmails, distance);
                console.log("---------------------------------------------");
                console.log(event.priorDaysToSendReminderEmails);
                console.log("---------------------------------------------");
                Events.updateEvent(event);
            }
        }
    }
  });
}

exports.sendEmail = function(to, subject, htmlBody) {
    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'ININCustomer@gmail.com',
            pass: 'ININ1234'
        }
    });

    var mailOptions = {
        from: 'ININCustomer@gmail.com',
        to: to,
        subject: subject,
        html: htmlBody
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
}