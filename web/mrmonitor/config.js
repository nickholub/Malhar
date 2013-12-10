var config = {};
config.resourceManager = {};

config.port = process.env.PORT || 3000;
config.resourceManager.host = 'localhost';
config.resourceManager.port = '8088';

module.exports = config
