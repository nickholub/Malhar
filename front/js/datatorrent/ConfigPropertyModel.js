var BaseModel = require('./BaseModel');

var ConfigPropertyModel = BaseModel.extend({

    debugName: 'config property',

    idAttribute: 'name',

    defaults: {
        name: '',
        value: '',
        description: ''
    },

    urlRoot: function() {
        return this.resourceUrl('ConfigProperty');
    }

});
exports = module.exports = ConfigPropertyModel;