var BaseView = require('./StepView');
var GatewayInfoModel = require('../../../../datatorrent/GatewayInfoModel');
var Bbind = DT.lib.Bbindings;
var Notifier = DT.lib.Notifier;

var SystemStepView = BaseView.extend({

    initialize: function(options) {
        BaseView.prototype.initialize.apply(this, arguments);
        this.dataSource = options.dataSource;

        this.error = false; //TODO
        this.about = new GatewayInfoModel({});
        this.about.fetch();
        this.listenTo(this.about, 'sync', this.render);
    },

    render: function() {
        var html = this.template({
            error: this.error,
            about: this.about
        });

        this.$el.html(html);

        if (this.assignments) {
            this.assign(this.assignments);
        }
        return this;
    }

});
exports = module.exports = SystemStepView;