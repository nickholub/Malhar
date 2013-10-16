var config = {};
config.web = {};
config.daemon = {};

config.daemon.host = 'localhost';
//config.daemon.port = 3390;
config.daemon.port = 3490;
config.web.port = process.env.PORT || 3003;

module.exports = config