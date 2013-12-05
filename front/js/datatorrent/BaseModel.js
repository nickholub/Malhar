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
var Notifier = require('./Notifier');
var Backbone = require('backbone');
var settings = require('./settings');
var util = require('./BaseUtil');
var BaseModel = Backbone.Model.extend({
    
    debugName: 'model',
    
    initialize: function(attrs, options) {
        options = options || {};
        if (options.hasOwnProperty('dataSource')) {
            this.dataSource = options.dataSource;
        }
    },
    
    settings: settings,
    
    resourceURL: util.resourceURL,
    
    resourceTopic: util.resourceTopic,
    
    resourceAction: util.resourceAction,
    
    subscribeToTopic: util.subscribeToTopic,
    
    checkForDataSource: function() {
        if (!this.dataSource) {
            throw new Error('No datasource found on this model.');
        }
    },
    
    fetch: function(options) {
        // Ensure options is an object
        options = options || {};
        
        // For jsonp testing purposes
        if (settings.wsRoot && options.url) {
            options.url = settings.wsRoot + options.url;
            options.dataType = 'jsonp';
        }
        
        // Give it a default error handler if "fetchError" attribute is present
        if (!options.error && this.fetchError) {
            options.error = _.bind(function(collection, response, options) {
                var obj;
                if (typeof this.fetchError === 'function') {
                    obj = this.fetchError.call(this, collection, response, options);
                } else {
                    obj = this.fetchError;
                }

                Notifier.error(obj);
            }, this);
        }
        
        LOG(1, 'fetching ' + this.debugName, ['options: ', options]);
        
        // Call super
        Backbone.Collection.prototype.fetch.call(this, options);
    },
    
    fetchError: util.fetchError,
    
    responseFormatError: util.responseFormatError,

    sync: function(method, model, options) {
        // READ/FETCH
        if ( method === 'read' ) {
            
            // Holds the original success function
            var success = options.success;
    
            // Wrap the success function:
            options.success = _.bind(function(resp) {
        
                // Allow for the response to be transformed by an optional
                // responseTransform attribute (can be a string or function).
        
                // Will hold the (possibly) transformed response
                var transformedResponse;
        
                // String: assumes the original response is in the format { `responseTransform`: [array of elements] }
                if (typeof this.responseTransform === 'string') {
                    transformedResponse = resp[this.responseTransform];
                }
        
                // Function: takes the response as an argument, should return an array of items.
                else if (typeof this.responseTransform === 'function') {
                    transformedResponse = this.responseTransform(resp);
                }
        
                // Nothing: the response should already be an array
                else {
                    transformedResponse = resp;
                }
        
                // Check that the result is, in fact, an array.
                // NOTE: Will only check if responseFormatError has been specified!
                if ( typeof transformedResponse !== 'object' && this.responseFormatError) {
                    var obj;
                    if (typeof this.responseFormatError === 'function') {
                        obj = this.responseFormatError.call(this, resp, transformedResponse);
                    } else {
                        obj = this.responseFormatError;
                    }
                    Notifier.error(obj);
                }
        
                // Call original success function with transformed response.
                success(transformedResponse);

                LOG(2, this.debugName + ' fetched', ['transformedResponse:', transformedResponse]);
        
            }, this);
        }
        
        return Backbone.sync.apply(this, arguments);
    }

});

exports = module.exports = BaseModel;