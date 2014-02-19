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
var BasePageView = DT.lib.BasePageView;
var ConfigPropertyCollection = DT.lib.ConfigPropertyCollection;
var ConfigIssueCollection = DT.lib.ConfigIssueCollection;

// widgets
var ConfigWelcomeWidget = require('../widgets/ConfigWelcomeWidget');

angular.module('app', ['ui.router'])
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        templateUrl: 'template/test.html',
        controller: 'MainCtrl'
      })
      .state('main.welcome', {
        templateUrl: 'template/step_welcome.html'
      })
      .state('main.license', {
        templateUrl: 'template/step_license.html'
      })
      .state('main.system', {
        templateUrl: 'template/step_system.html'
      })
      .state('main.performance', {
        templateUrl: 'template/step_performance.html'
      })
      .state('main.applications', {
        templateUrl: 'template/step_applications.html'
      })
      .state('main.summary', {
        templateUrl: 'template/step_summary.html'
      });
  })
  .run(function ($state) {
    $state.go('main.welcome');
  })
  .controller('MainCtrl', function ($scope, $state) {
    $scope.value = new Date();

    $scope.select = function (event, step) {
      event.preventDefault();

      console.log(step);
      $scope.selStep = step;

      $state.go('main.' + step.id);
    };

    $scope.steps = [
      {
        id: 'welcome',
        label: 'Welcome!'
      },
      {
        id: 'license',
        label: 'License'
      },
      {
        id: 'system',
        label: 'System'
      },
      {
        id: 'performance',
        label: 'Performance'
      },
      {
        id: 'applications',
        label: 'Applications'
      },
      {
        id: 'summary',
        label: 'Summary'
      }
    ];

    $scope.selStep = $scope.steps[0];
  });

ConfigWelcomeWidget = DT.lib.WidgetView.extend({

  injections: 'app',

  initialize1: function(options) {
    console.log('__angular view');
    console.log(options);
  },

  render: function () {
    DT.lib.WidgetView.prototype.render.apply(this, _.toArray(arguments));

    this.$('.widget-content').attr('ui-view', '');

    angular.bootstrap(
      this.$('.widget-content')[0],
      ['app']
    );

    return this;
  }

});

var WelcomePageView = BasePageView.extend({

    pageName: 'WelcomePageView',

    defaultDashes: [
        {
            dash_id: 'Welcome!',
            widgets: [
                { widget: 'ConfigWelcome', id: 'Welcome!' }
            ]
        }
    ],

    useDashMgr: false,

    initialize: function(options) {
        BasePageView.prototype.initialize.call(this,options);
        
        this.properties = new ConfigPropertyCollection([]);
        this.properties.fetch();
        window.props = this.properties;
        this.issues = new ConfigIssueCollection([]);
        this.issues.fetch();

        this.defineWidgets([
            {
                name: 'ConfigWelcome',
                defaultId: 'Welcome!',
                view: ConfigWelcomeWidget,
                limit: 1,
                inject: {
                    collection: this.properties,
                    issues: this.issues
                }
            }
        ]);
        this.loadDashboards('Welcome!');
    }

});

exports = module.exports = WelcomePageView;