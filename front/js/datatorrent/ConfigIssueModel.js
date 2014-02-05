var BaseModel = require('./BaseModel');

var ConfigIssueModel = BaseModel.extend({

    debugName: 'config issue',

    idAttribute: 'name',

    defaults: {
        name: '',
        value: '',
        description: ''
    },

    urlRoot: function() {
        return this.resourceURL('ConfigIssue');
    }

});
exports = module.exports = ConfigIssueModel;