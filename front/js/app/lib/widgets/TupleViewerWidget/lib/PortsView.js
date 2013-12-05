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
 * Ports View
 * 
 * This is the UI object used to select or deselect ports.
 * 
*/
var _ = require('underscore');
var kt = require('knights-templar');
var BaseView = require('bassview');
var PortsView = BaseView.extend({
    
    tagName: "form",
    
    className: "ports-frm",
    
    render: function() {
        
        this.$el.empty();
        
        this.collection.each(function(port) {
            var json = port.toJSON();
            var markup = this.template(json);
            this.$el.append(markup);
        },this);
        
    },
    
    events: {
        'click .port input[type="checkbox"]': 'portClick'
    },
    
    portClick: function() {
        var selected = [];
        this.$('input[type="checkbox"]').each(function(i, el){
            if (this.checked) selected.push(this.value);
        });
        console.log('selected', selected);
        this.collection.each(function(port){
            if (selected.indexOf(port.get("id")) > -1) port.set("selected", true);
            else port.set("selected", false);
        });
    },
    
    template: kt.make(__dirname+'/PortTemplate.html','_')
    
});

exports = module.exports = PortsView