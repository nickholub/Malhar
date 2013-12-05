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
var bormat = require('bormat');
var BaseView = DT.widgets.OverviewWidget;
var PortOverviewWidget = BaseView.extend({
    
    template: kt.make(__dirname+'/PortOverviewWidget.html','_')

});
exports = module.exports = PortOverviewWidget