var BaseView = require('bassview');
var StepListItemView = require('./StepListItemView');
var StepListView = BaseView.extend({

    render: function() {
        this.collection.each(function(step) {
            var view = new StepListItemView({ model: step });
            this.$el.append(view.render().el);
        }, this);
        return this;
    }

});
exports = module.exports = StepListView;