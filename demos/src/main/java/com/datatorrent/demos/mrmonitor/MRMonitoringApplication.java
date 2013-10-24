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
package com.datatorrent.demos.mrmonitor;

import java.net.URI;

import org.apache.commons.lang.StringUtils;
import org.apache.hadoop.conf.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.datatorrent.api.Context.OperatorContext;
import com.datatorrent.api.DAG;
import com.datatorrent.api.DAG.Locality;
import com.datatorrent.api.StreamingApplication;
import com.datatorrent.lib.io.PubSubWebSocketInputOperator;
import com.datatorrent.lib.io.PubSubWebSocketOutputOperator;

/**
 * <p>
 * MRDebuggerApplication class.
 * </p>
 *
 * @since 0.3.4
 */
public class MRMonitoringApplication implements StreamingApplication
{

  private static final Logger logger = LoggerFactory.getLogger(MRMonitoringApplication.class);

  @Override
  public void populateDAG(DAG dag, Configuration conf)
  {
    String daemonAddress = dag.attrValue(DAG.DAEMON_ADDRESS, null);
    if (daemonAddress == null || StringUtils.isEmpty(daemonAddress)) {
      daemonAddress = "10.0.2.15:9790";
    }

    int numberOfPartitions = conf.getInt(MRMonitoringApplication.class.getName() + ".numberOfMonitoringOperators", 1);
    int maxNumberOfJobs = conf.getInt(MRMonitoringApplication.class.getName() + ".maxNumberOfJobsPerOperator", Constants.MAX_MAP_SIZE);
    // logger.info(" number of partitions {} ",numberOfPartitions);

    MRJobStatusOperator mrJobOperator = dag.addOperator("Monitoring-Operator", new MRJobStatusOperator());
    mrJobOperator.setMaxMapSize(maxNumberOfJobs);
    dag.setAttribute(mrJobOperator, OperatorContext.INITIAL_PARTITION_COUNT, numberOfPartitions);

    URI uri = URI.create("ws://" + daemonAddress + "/pubsub");
    logger.info("WebSocket with daemon at {}", daemonAddress);

    PubSubWebSocketInputOperator wsIn = dag.addOperator("Input-Query-Operator", new PubSubWebSocketInputOperator());
    wsIn.setUri(uri);
    wsIn.addTopic("contrib.summit.mrDebugger.mrDebuggerQuery");

    MapToMRObjectOperator convertorOper = dag.addOperator("Input-Query-Conversion-Operator", new MapToMRObjectOperator());
    dag.addStream("queryConversion", wsIn.outputPort, convertorOper.input).setLocality(Locality.CONTAINER_LOCAL);

    dag.addStream("queryProcessing", convertorOper.output, mrJobOperator.input);

    PubSubWebSocketOutputOperator<Object> wsOut = dag.addOperator("Job-Output-Operator", new PubSubWebSocketOutputOperator<Object>());
    wsOut.setUri(uri);
    wsOut.setTopic("contrib.summit.mrDebugger.jobResult");

    PubSubWebSocketOutputOperator<Object> wsMapOut = dag.addOperator("Map-Output-Operator", new PubSubWebSocketOutputOperator<Object>());
    wsMapOut.setUri(uri);
    wsMapOut.setTopic("contrib.summit.mrDebugger.mapResult");

    PubSubWebSocketOutputOperator<Object> wsReduceOut = dag.addOperator("Reduce-Output-Operator", new PubSubWebSocketOutputOperator<Object>());
    wsReduceOut.setUri(uri);
    wsReduceOut.setTopic("contrib.summit.mrDebugger.reduceResult");

    dag.addStream("jobConsoledata", mrJobOperator.output, wsOut.input);
    dag.addStream("mapConsoledata", mrJobOperator.mapOutput, wsMapOut.input);
    dag.addStream("reduceConsoledata", mrJobOperator.reduceOutput, wsReduceOut.input);

  }

}
