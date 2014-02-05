var BaseCollection = require('./BaseCollection');
var ConfigIssueModel = require('./ConfigIssueModel');

var ConfigIssueCollection = BaseCollection.extend({

    debugName: 'config issues',

    model: ConfigIssueModel,

    url: function() {
        return this.resourceURL('ConfigIssue');
    },

    responseTransform: 'issues'

});

exports = module.exports = ConfigIssueCollection;