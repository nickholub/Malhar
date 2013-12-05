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
/**
 * Info widget for port instances.
 */
var _ = require('underscore');
var kt = require('knights-templar');
var BaseView = DT.widgets.InfoWidget;
var PortInfoWidget = BaseView.extend({

    initialize: function(options) {
        BaseView.prototype.initialize.call(this, options);

        this.listenToOnce(this.model, 'change', this.render);
    },

    template: kt.make(__dirname+'/PortInfoWidget.html','_')

});
exports = module.exports = PortInfoWidget