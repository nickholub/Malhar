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
var Col = require('./ApplicationSubCollection');
describe('ApplicationSubCollection.js', function() {
    
	it('should set appId and dataSource if provided in the options', function() {
		var dataSource = {};
	    var c = new Col([], { dataSource: dataSource, appId: 'app1' });
	    expect(dataSource).to.equal(c.dataSource);
	    expect(c.appId).to.equal('app1');
	});

});