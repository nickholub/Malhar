var _ = require('underscore');
var BaseCollection = require('./BaseCollection');
var ConfigPropertyModel = require('./ConfigPropertyModel');

var ConfigPropertyCollection = BaseCollection.extend({

    debugName: 'config properties',

    model: ConfigPropertyModel,

    url: function() {
        return this.resourceURL('ConfigProperty');
    },

    responseTransform: function(response) {
        var result = [];
        _.each(response, function(obj, name) {
            obj.name = name;
            result.push(obj);
        });
        return result;
    },

    setIssues: function(issues) {
        if (this.issues) {
            this.stopListening(this.issues);
        }
        this.issues = issues;
        this.updateIssues();
        this.listenTo(this.issues, 'change', this.updateIssues);
    },

    updateIssues: function() {
        if (this.issues) {

            // unset all issues
            this.each(function(prop) {
                prop.unset('issue');
            });

            // look for issues to update
            this.issues.each(function(issue) {
                var propertyName, property;
                // Check if issue pertains to a property
                if (propertyName = issue.get('property')) {
                    property = this.get(propertyName);
                    if (property) {
                        property.set('issue', issue.toJSON());
                    }
                }
            }, this);
        }
    }

});

exports = module.exports = ConfigPropertyCollection;