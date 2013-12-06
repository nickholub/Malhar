var express = require('express');
var http = require('http');
var httpProxy = require('http-proxy');
var config = require('./config');

var app = express();

var proxy = new httpProxy.RoutingProxy();

// all environments
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/app'));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/ws/*', function(req, res) {
    console.log(req.path);
    proxy.proxyRequest(req, res, {
        host: config.daemon.host,
        port: config.daemon.port
    });
});

http.createServer(app).listen(config.web.port, function(){
    console.log('Express server listening on port ' + config.web.port);
});
