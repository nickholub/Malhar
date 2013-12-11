var express = require('express');
var sockjs  = require('sockjs');
var http = require('http');
var httpProxy = require('http-proxy');
var config = require('./config');

var app = express();

var proxy = new httpProxy.HttpProxy({
  target: {
    host: config.resourceManager.host,
    port: config.resourceManager.port
  }
});

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

app.get('/ws/v1/cluster/apps', function(req, res) {
  proxy.proxyRequest(req, res);
});

var items = null;

var clients = {};
var clientCount = 0;
var interval;

var gaugeValue = 50;

function broadcast() {
    gaugeValue += Math.random() * 40 - 20;
    gaugeValue = gaugeValue < 0 ? 0 : gaugeValue > 100 ? 100 : gaugeValue;
    var time = Date.now();

    var job = {
      mapProgress: gaugeValue,
      reduceProgress: gaugeValue + 5
    }
    var data = JSON.stringify({ job: job });

    //var msgObject = { topic: 'contrib.summit.mrDebugger.jobResult', data: {
    //  value: Math.floor(gaugeValue), timestamp: time
    //}};
    var msgObject = { topic: 'contrib.summit.mrDebugger.jobResult', data: data};

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