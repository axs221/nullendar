
exports.Worker = function(services) {
  console.log("Starting Mailer timer!");

  this.services = services;
}

exports.Worker.prototype.startTimer = function(sleepDuration) {
  tick(sleepDuration, this.services);
}

function tick(sleepDuration, services) {
  for (var x = 0; x < services.length; x++) {
    var service = services[x];

    service.execute();
  }


  sleep(sleepDuration, 
   function() { tick(sleepDuration, services) }
  );
}

function sleep(millis, callback) {
    setTimeout(function()
            { callback(); }
    , millis);
}