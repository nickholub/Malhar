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
var StepCollection = require('./StepCollection');
var steps = require('./steps');
var StepListView = require('./StepListView');

/**
 * ConfigWelcomeWidget
 * 
 * Welcomes the user to the datadorrent console.
 * Takes the form of a "install wizard" with 
 * sequential steps that show potential issues and
 * offer ways of fixing those issues.
*/
var ConfigWelcomeWidget = BaseView.extend({
    
    initialize: function(options) {

        BaseView.prototype.initialize.call(this, options);

        // installation issues, instantiated 
        // and fetched on WelcomePageView
        this.issues = options.issues;

        // models for each step in this welcome
        // process.
        this.steps = new StepCollection(steps);
        this.steps.setActive('welcome');

        // this view contains the list of steps on the left
        // side of the wizard. 
        this.subview('step_list', new StepListView({
            collection: this.steps
        }));

        // when active step changes, update the main 
        // pane with the appropriate step template.
        this.listenTo(this.steps, 'change:active', function(model, active) {
            // this catches change events when steps
            // get deactivated; we are only interested
            // in steps becoming active
            if (!active) {
                return;
            }
            this.goToStep(model);
        });
    },
    
    render: function() {
        // Sets up the base markup for the wizard
        var html = this.template({});
        this.$el.html(html);

        // Assigns the step_list to the <ol>
        this.assign({
            'ol.step-list': 'step_list'
        });

        // Goes to active step.
        this.goToStep(this.steps.getActive());

        // Allow chaining
        return this;
    },

    events: {
        'click .install-step-link[data-action]': 'onStepLinkClick'
    },

    onStepLinkClick: function(e) {
        e.preventDefault();
        var $target = $(e.target);

        if (!$target.hasClass('install-step-link')) {
            // look for parent
            $target = $target.parents('.install-step-link');
        }

        var step = $target.data('action');
        if (step) {
            this.steps.setActive(step);
        }
    },

    goToStep: function(step) {
        // Retrieves template for the step
        var template = this.stepTemplates[step.get('id')];
        if (!template) {
            throw new Error('No step template found for ' + step.get('id') + ' step!');
        }

        // Injects the issues, properties, and step model
        // into the template.
        var html = template({
            issues: this.issues.toJSON(),
            properties: this.collection.toJSON(),
            model: step.toJSON()
        });
        this.$('.install-steps-pane .inner').html(html);
    },
    
    // base markup for the wizard
    template: kt.make(__dirname+'/ConfigWelcomeWidget.html','_'),

    // markup for each step
    stepTemplates: {
        welcome: kt.make(__dirname+'/step_welcome.html'),
        license: kt.make(__dirname+'/step_license.html'),
        system: kt.make(__dirname+'/step_system.html'),
        performance: kt.make(__dirname+'/step_performance.html'),
        applications: kt.make(__dirname+'/step_applications.html'),
        summary: kt.make(__dirname+'/step_summary.html')
    }
    
});

exports = module.exports = ConfigWelcomeWidget;