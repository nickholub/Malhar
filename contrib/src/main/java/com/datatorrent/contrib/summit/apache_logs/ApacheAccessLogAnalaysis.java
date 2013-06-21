/*
 *  Copyright (c) 2012 Malhar, Inc. All Rights Reserved.
 */
package com.datatorrent.contrib.summit.apache_logs;

import java.net.URI;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.hadoop.conf.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.datatorrent.api.StreamingApplication;
import com.datatorrent.api.DAG;
import com.datatorrent.api.Context.OperatorContext;
import com.datatorrent.api.Operator.InputPort;
import com.datatorrent.contrib.ads_dimension.ApplicationRandomData;
import com.datatorrent.contrib.ads_dimension.ApplicationRandomData.AdsDimensionOperator;
import com.datatorrent.contrib.redis.RedisNumberAggregateOutputOperator;
import com.datatorrent.contrib.redis.RedisOutputOperator;
import com.datatorrent.lib.algo.TopN;
import com.datatorrent.lib.algo.TopNUnique;
import com.datatorrent.lib.io.ApacheGenRandomLogs;
import com.datatorrent.lib.io.ConsoleOutputOperator;
import com.datatorrent.lib.logs.ApacheVirtualLogParseOperator;
import com.datatorrent.lib.math.Sum;
import com.datatorrent.lib.testbench.CompareFilterTuples;
import com.datatorrent.lib.testbench.CountOccurance;
import com.datatorrent.lib.testbench.HttpStatusFilter;
import com.datatorrent.lib.testbench.TopOccurance;
import com.datatorrent.lib.util.DimensionTimeBucketOperator;
import com.datatorrent.lib.util.DimensionTimeBucketSumOperator;
/**
 * @author Dinesh Prasad (dinesh@malhar-inc.com)
 */
public class ApacheAccessLogAnalaysis implements StreamingApplication
{
	private static final Logger LOG = LoggerFactory.getLogger(ApacheAccessLogAnalaysis.class);
	
	public static class TimeDimensionOperator extends DimensionTimeBucketSumOperator
  {
    @Override
    protected long extractTimeFromTuple(Map<String, Object> tuple)
    {
      return (Long)tuple.get("timestamp");
    }

  }
	
  private InputPort<Object> consoleOutput(DAG dag, String operatorName)
  {
    ConsoleOutputOperator operator = dag.addOperator(operatorName, new ConsoleOutputOperator());
    return operator.input;
  }
  
  public TimeDimensionOperator getPageDimensionTimeBucketSumOperator(String name, DAG dag)
  {
  	TimeDimensionOperator oper = dag.addOperator(name, TimeDimensionOperator.class);
    oper.addDimensionKeyName("item");
    oper.addValueKeyName("view");
    oper.setTimeBucketFlags(DimensionTimeBucketOperator.TIMEBUCKET_DAY | DimensionTimeBucketOperator.TIMEBUCKET_HOUR | DimensionTimeBucketOperator.TIMEBUCKET_MINUTE);
    return oper;
  }
  
  public InputPort<Map<String, Map<String, Number>>> getRedisOutput(String name, DAG dag, int dbIndex)
  {
    @SuppressWarnings("unchecked")
		RedisNumberAggregateOutputOperator<String, Map<String, Number>> oper = dag.addOperator(name, RedisNumberAggregateOutputOperator.class);
    oper.selectDatabase(dbIndex);
    return oper.input;
  }
  
	@Override
	public void populateDAG(DAG dag, Configuration conf)
	{
  	// Generate random apche logs
  	ApacheGenRandomLogs rand = dag.addOperator("rand", new ApacheGenRandomLogs());
  	
  	// parse log operator  
  	ApacheVirtualLogParseOperator parser = dag.addOperator("parser", new ApacheVirtualLogParseOperator());
  	dag.addStream("parserInput", rand.outport, parser.data).setInline(true);
  	
  	// count occurance operator  
  	CountOccurance<String> urlCounter = dag.addOperator("urlCounter", new CountOccurance<String>());
  	dag.addStream("urlStream", parser.outputUrl, urlCounter.inport);
  	dag.getMeta(urlCounter).getAttributes().attr(OperatorContext.APPLICATION_WINDOW_COUNT).set(2);
  	
    // url time dimension  
  	TimeDimensionOperator dimensionOperator = getPageDimensionTimeBucketSumOperator("Dimension", dag);
    dag.getMeta(dimensionOperator).getAttributes().attr(OperatorContext.APPLICATION_WINDOW_COUNT).set(10);
    dag.addStream("input_dimension", urlCounter.dimensionOut, dimensionOperator.in);
    dag.addStream("dimension_out", dimensionOperator.out,  getRedisOutput("redislog1", dag, 1)).setInline(true); 
  	
  	// format output for redix operator  
  	TopOccurance topOccur = dag.addOperator("topOccur", new TopOccurance());
  	topOccur.setN(10);
  	dag.addStream("topOccurStream", urlCounter.outport, topOccur.inport);
  	 
  	// redix output 
  	RedisOutputOperator<Integer, String> redis = dag.addOperator("redislog2", new RedisOutputOperator<Integer, String>());
  	redis.selectDatabase(2);
  	
  	// output to console      
    dag.addStream("rand_console", topOccur.outport, redis.input).setInline(true);
    
    // count server name occurance operator  
   	CountOccurance<String> serverCounter = dag.addOperator("serverCounter", new CountOccurance<String>());
   	dag.addStream("serverStream", parser.outputServerName, serverCounter.inport).setInline(true);
   	dag.getMeta(serverCounter).getAttributes().attr(OperatorContext.APPLICATION_WINDOW_COUNT).set(2);
   	
   	// url time dimension  
   	TimeDimensionOperator serverDimensionOper = getPageDimensionTimeBucketSumOperator("serverDimensionOper", dag);
    dag.getMeta(serverDimensionOper).getAttributes().attr(OperatorContext.APPLICATION_WINDOW_COUNT).set(10);
    dag.addStream("server_dimension", serverCounter.dimensionOut, serverDimensionOper.in).setInline(true);
    dag.addStream("server_dimension_out", serverDimensionOper.out,  getRedisOutput("redislog4", dag, 4)).setInline(true); 
    
 
   // count server name occurance operator  
    CountOccurance<String> serverCounter1 = dag.addOperator("serverCounter1", new CountOccurance<String>());
   	dag.addStream("serverStream1", parser.outputServerName1, serverCounter1.inport).setInline(true);
   	dag.getMeta(serverCounter1).getAttributes().attr(OperatorContext.APPLICATION_WINDOW_COUNT).set(2);
    
    // format output for redix operator  
    TopOccurance serverTop = dag.addOperator("serverTop", new TopOccurance());
   	serverTop.setN(10);
   	dag.addStream("serverTopStream", serverCounter1.outport, serverTop.inport);
    //dag.addStream("redisgt8Stream", serverTop.outport,  consoleOutput(dag, "console")).setInline(true);
   	
    // redix output 
    RedisOutputOperator<Integer, String> redis10 = dag.addOperator("redislog10", new RedisOutputOperator<Integer, String>());
   	redis10.selectDatabase(10);
   	dag.addStream("rand_console10", serverTop.outport, redis10.input).setInline(true);
   	
    // count ip occurance operator  
    CountOccurance<String> ipCounter = dag.addOperator("ipCounter", new CountOccurance<String>());
   	dag.addStream("ipStream", parser.outputIPAddress, ipCounter.inport).setInline(true);
   	dag.getMeta(ipCounter).getAttributes().attr(OperatorContext.APPLICATION_WINDOW_COUNT).set(2);
   	
    // Top ip client counter  
    TopOccurance topIpOccur = dag.addOperator("topIpOccur", new TopOccurance());
    topIpOccur.setN(10);
    topIpOccur.setThreshHold(1000);
  	dag.addStream("topIpOccurStream", ipCounter.outport, topIpOccur.inport).setInline(true);
  	
  	// output  ip counter    
  	RedisOutputOperator<Integer, String> redisIpCounter = dag.addOperator("redislog3", new RedisOutputOperator<Integer, String>());
  	redisIpCounter.selectDatabase(3);
  	dag.addStream("topIpRedixStream", topIpOccur.outport,  redisIpCounter.input).setInline(true);
    
    // output client more than 5 urls in sec
    RedisOutputOperator<Integer, String> redisgt5 = dag.addOperator("redislog5", new RedisOutputOperator<Integer, String>());
    redisgt5.selectDatabase(5);
   	dag.addStream("redisgt5Stream", topIpOccur.gtThreshHold,  redisgt5.input).setInline(true);
   	
   	// get filter status operator 
    HttpStatusFilter urlHttpFilter = dag.addOperator("urlStatusCheck", new HttpStatusFilter());
    urlHttpFilter.setFilterStatus("404");
    dag.getMeta(urlHttpFilter).getAttributes().attr(OperatorContext.APPLICATION_WINDOW_COUNT).set(2);
   	dag.addStream("urlStatusCheckStream", parser.outUrlStatus, urlHttpFilter.inport).setInline(true);
   	TopOccurance topUrlStatus = dag.addOperator("topUrlStatus", new TopOccurance());
   	topUrlStatus.setN(10);
   	dag.addStream("topUrlStatusStream", urlHttpFilter.outport,  topUrlStatus.inport).setInline(true);
   // dag.addStream("testconsole", topUrlStatus.outport,  consoleOutput(dag, "console")).setInline(true); 
  	RedisOutputOperator<Integer, String> redisgt7 = dag.addOperator("redislog7", new RedisOutputOperator<Integer, String>());
    redisgt7.selectDatabase(7);
    dag.addStream("redisgt7Stream", topUrlStatus.outport,  redisgt7.input).setInline(true);
   	
   	// client data usage 
   	Sum<Integer> totalOper =  dag.addOperator("totaloper", new Sum<Integer>());
   	dag.getMeta(totalOper).getAttributes().attr(OperatorContext.APPLICATION_WINDOW_COUNT).set(2);
   	dag.addStream("clientDataFilterStream", parser.clientDataUsage, totalOper.data).setInline(true);
   	RedisOutputOperator<Integer, Integer> redisgt9 = dag.addOperator("redislog9", new RedisOutputOperator<Integer, Integer>());
    redisgt9.selectDatabase(9);
   	dag.addStream("redisgt9Stream", totalOper.redisport,  redisgt9.input).setInline(true);
   	//dag.addStream("redisgt9Stream", clientDataFilter.redisport,  consoleOutput(dag, "console")).setInline(true);  */
   	
    // get filter status operator 
    HttpStatusFilter serverHttpFilter = dag.addOperator("serverHttpFilter", new HttpStatusFilter());
    serverHttpFilter.setFilterStatus("404");
    dag.getMeta(serverHttpFilter).getAttributes().attr(OperatorContext.APPLICATION_WINDOW_COUNT).set(2);
   	dag.addStream("serverHttpFilterStream", parser.outServerStatus, serverHttpFilter.inport).setInline(true);
   	TopOccurance serverTop404 = dag.addOperator("serverTop404", new TopOccurance());
   	serverTop404.setN(10);
   	dag.addStream("serverTop404Stream", serverHttpFilter.outport,  serverTop404.inport).setInline(true);
  	RedisOutputOperator<Integer, String> redisgt8 = dag.addOperator("redislog8", new RedisOutputOperator<Integer, String>());
    redisgt8.selectDatabase(8);
    dag.addStream("redisgt8Stream", serverTop404.outport,  redisgt8.input).setInline(true);
  }
}