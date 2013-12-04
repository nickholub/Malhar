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
exports = module.exports = {
    //wsRoot: 'http://localhost:3000',
    alertUrlRoot: '/alerts',
    version: 'v1',
    maxAlertActions: 3,
    urls: {
        
        Application              :'/ws/:v/applications',
        ClusterMetrics           :'/ws/:v/cluster/metrics',
        LogicalPlan              :'/ws/:v/applications/:appId/logicalPlan',
        PhysicalPlan             :'/ws/:v/applications/:appId/physicalPlan',
        Operator                 :'/ws/:v/applications/:appId/physicalPlan/operators',
        Port                     :'/ws/:v/applications/:appid/physicalPlan/operators/:operatorId/ports',
        Container                :'/ws/:v/applications/:appId/physicalPlan/containers',
        Alert                    :'/ws/:v/applications/:appId/alerts',
        AppRecordings            :'/ws/:v/applications/:appId/recordings',
        Recording                :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings',
        RecordingTuples          :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings/:startTime/tuples',
        AlertTemplate            :'/ws/:v/alertTemplates',
        OpProperties             :'/ws/:v/applications/:appId/logicalPlan/operators/:operatorName/properties',
        Jar                      :'/ws/:v/jars',
        JarApps                  :'/ws/:v/jars/:fileName/applications'
        
    },
    
    actions: {
        startOpRecording         :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings/start',
        stopOpRecording          :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings/stop',
        startPortRecording       :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/ports/:portName/recordings/start',
        stopPortRecording        :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/ports/:portName/recordings/stop',
        shutdownApp              :'/ws/:v/applications/:appId/shutdown',
        killApp                  :'/ws/:v/applications/:appId/kill',
        launchApp                :'/ws/:v/jars/:fileName/applications/:appName/launch'
    },
    
    topics: {
        
        ClusterMetrics           :'cluster.metrics',
        Applications             :'applications',
        Application              :'applications.:appId',
        Operators                :'applications.:appId.operators',
        Containers               :'applications.:appId.containers'
        
    },

    dag: {
        edges: {
            NONE: '5,1',
            THREAD_LOCAL: null,
            CONTAINER_LOCAL: '1,1',
            NODE_LOCAL: '1,3',
            RACK_LOCAL: '1,5'
        }
    },

    interpolateParams: function(string, params) {
        return string.replace(/:(\w+)/g, function(match, paramName) {
            return params[paramName];
        });
    }
};