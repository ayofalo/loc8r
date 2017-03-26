var readLine = require("readline");
if (process.platform === "win32") { /*process as a property that stores pltform type*/
  var rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on("SIGINT", function() {
    process.emit("SIGINT");
  });
}

var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/Loc8r';

if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGODB_URI; //process.env.MONGOLAB_URI;
}
mongoose.connect(dbURI);
mongoose.connection.on('connected', function() { //Monitoring the connection event
  console.log('Mongoose connected to' + dbURI);
});
mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error:' + err);
});
mongoose.connection.on('disconnected', function() {
  console.log('Monoose disconnected');
});
gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function() {
    console.log('Mongoose disconnected through' + msg);
    callback();
  });
};

// For nodemon restarts
process.once('SIGUSR2', function() {
  gracefulShutdown('nodemon restart', function() {
    process.kill(process.pid, 'SIGUSR2'); // The process.kill is a continuation callback that is executed after the gracefulShutdown is executed
  });
});

//For app termination
process.on('SIGINT', function() {
  gracefulShutdown('app termination', function() {
    process.exit(0); /*Even after declaring a function, the process.kill was added but it wasnt originally declared. I find it very strange.*/
  });
});
// For Heroku app termination
process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app shutdown', function() {
    process.exit(0);
  });

});
//I can easily copy this from application  mainly becaue the events i am listening for are always the same. 
//I only have to change the database connection string. I wold also require it in the app.js mainy so that the connection opens up early on in the application's life. 
require('./locations');
