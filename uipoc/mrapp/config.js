var config = {};
config.web = {};
config.daemon = {};

config.daemon.host = 'localhost';
config.daemon.port = 3391;
config.web.port = process.env.PORT || 3002;

module.exports = config