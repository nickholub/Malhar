var express = require('express');
var sockjs  = require('sockjs');
var http = require('http');
var config = require('./config');

var app = express();

// all environments
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

console.log('environment: ' + app.get('env'));

if ('production' == app.get('env')) {
    app.use(express.static(__dirname + '/dist'));
} else if ('development' == app.get('env')) {
    app.use(express.static(__dirname + '/app'));
    app.use(express.errorHandler());
}

var items = null;

var clients = {};
var clientCount = 0;
var interval;

var gaugeValue = 50;

function broadcast() {
    gaugeValue += Math.random() * 40 - 20;
    gaugeValue = gaugeValue < 0 ? 0 : gaugeValue > 100 ? 100 : gaugeValue;
    var time = Date.now();

    var msgObject = { topic: 'topic1', data: {
      value: Math.floor(gaugeValue), timestamp: time
    }};

    var msg = JSON.stringify(msgObject);

    for (var key in clients) {
        if(clients.hasOwnProperty(key)) {
            clients[key].write(msg);
        }
    }
}

function startBroadcast () {
    interval = setInterval(broadcast, 1000);
}

var sockjsServer = sockjs.createServer();

sockjsServer.on('connection', function(conn) {
    clientCount++;
    if (clientCount === 1) {
        startBroadcast();
    }

    clients[conn.id] = conn;

    conn.on('close', function() {
        clientCount--;
        delete clients[conn.id];
        if (clientCount === 0) {
            clearInterval(interval);
        }
    });
});

var server = http.createServer(app).listen(config.port, function(){
    console.log('Express server listening on port ' + config.port);
});

sockjsServer.installHandlers(server, { prefix: '/sockjs' });