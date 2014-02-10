/*
 * Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var _ = require('underscore');
var kt = require('knights-templar');
var BaseView = DT.lib.WidgetView;

/**
 * ConfigWelcomeWidget
 * 
 * Welcomes the user to the datadorrent console
 *
*/
var ConfigWelcomeWidget = BaseView.extend({
    
    initialize: function(options) {
        BaseView.prototype.initialize.call(this, options);
        this.issues = options.issues;
    },
    
    render: function() {
        var html = this.template();
        this.$el.html(html);
        this.goToStep('welcome');
        return this;
    },

    events: {
        'click .install-step-link': 'onStepLinkClick'
    },

    onStepLinkClick: function(e) {
        e.preventDefault();
        var $target = $(e.target);
        var step = $target.data('action');
        if (step) this.goToStep(step);
    },

    goToStep: function(step) {
        this.$('.install-steps-nav .install-step-link').removeClass('active');
        this.$('.install-steps-nav .install-step-link[data-action="' + step + '"]').addClass('active');
        this.$('.install-steps-pane .inner').html(this.steps[step]({
            issues: this.issues.toJSON(),
            properties: this.collection.toJSON()
        }));
    },
    
    template: kt.make(__dirname+'/ConfigWelcomeWidget.html','_'),

    steps: {
        welcome: kt.make(__dirname+'/step_welcome.html'),
        system: kt.make(__dirname+'/step_system.html'),
        performance: kt.make(__dirname+'/step_performance.html'),
        applications: kt.make(__dirname+'/step_applications.html'),
        summary: kt.make(__dirname+'/step_summary.html')
    }
    
});

exports = module.exports = ConfigWelcomeWidget;