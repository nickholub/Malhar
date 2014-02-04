var BaseCollection = require('./BaseCollection');
var ConfigPropertyModel = require('./ConfigPropertyModel');

var ConfigPropertyCollection = BaseCollection.extend({

    debugName: 'config properties',

    model: ConfigPropertyModel,

    url: function() {
        return this.resourceUrl('ConfigProperty');
    }

});

exports = module.exports = ConfigPropertyCollection;