var _ = require('underscore');
var BaseView = require('./StepView');

var LicenseOfflineView = BaseView.extend({

    initialize: function(options) {
        BaseView.prototype.initialize.apply(this, arguments);

        this.requestText = options.stateOptions.licenseRequestBlob;
    },

    render: function() {
        var html = this.template({
            requestText: this.requestText
        });
        this.$el.html(html);

        _.defer(function () {
            this.$el.find('textarea').focus();
            this.$el.find('textarea').select();
        }.bind(this));

        return this;
    }

});

exports = module.exports = LicenseOfflineView;