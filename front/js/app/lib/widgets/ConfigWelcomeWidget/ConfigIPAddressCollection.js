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
var Backbone = require('backbone');
var BaseCollection = require('../../../../datatorrent/BaseCollection');
var path = require('path');

var ConfigIPAddressCollection = BaseCollection.extend({

    debugName: 'ConfigIPAddressCollection',

    responseTransform: 'ipAddresses',

    initialize: function(attributes, options) {
        BaseCollection.prototype.initialize.call(this, attributes, options);
    },

    url: function() {
        return this.resourceURL('ConfigIPAddresses');
    },

    fetch: function(options) {
        options = options || {};
        options.reset = true;
        BaseCollection.prototype.fetch.call(this, options);
    },

    fetchError: function() {
        //TODO
        //Notifier.error({
        //    title: 'Could not get IP addresses',
        //    text: 'An error occurred retrieving IP addresses.'
        //});
    }
});

exports = module.exports = ConfigIPAddressCollection;