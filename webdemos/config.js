var path = require('path');

var config = {};
config.web = {};
config.redis = {};
config.adsdimensions = {};
config.adsdimensions.redis = {};
config.siteops = {};
config.siteops.redis = {};
config.machine = {};
config.machine.redis = {};

config.web.port = process.env.PORT || 3001;
config.web.webSocketUrl = null; // 'ws://localhost:9090/pubsub' for local Daemon
config.adsdimensions.redis.host = null; // 'localhost' for local Redis server
config.adsdimensions.redis.port = null; // 6379 is default Redis port
config.siteops.redis.host = 'localhost';
config.siteops.redis.port = 5379;
config.siteops.redis.dbIndex = 15;
config.machine.redis.host = null;
config.machine.redis.port = null;
config.machine.redis.dbIndex = 0;

module.exports = config