var Backbone = require('backbone');
var ModeCollection = Backbone.Collection.extend({
    clearActive: function(options) {
        this.each(function(mode) {
            mode.set({ 'active': false }, options)
        });
    }
});
exports = module.exports = ModeCollection;