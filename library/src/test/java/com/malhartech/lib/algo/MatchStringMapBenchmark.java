/**
 * Copyright (c) 2012-2012 Malhar, Inc. All rights reserved.
 */
package com.malhartech.lib.algo;

import com.malhartech.engine.TestCountAndLastTupleSink;
import java.util.HashMap;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * Performance tests for {@link com.malhartech.lib.algo.MatchStringMap}<p>
 *
 */
public class MatchStringMapBenchmark
{
  private static Logger log = LoggerFactory.getLogger(MatchStringMapBenchmark.class);

  /**
   * Test node logic emits correct results
   */
  @Test
  @SuppressWarnings("SleepWhileInLoop")
  @Category(com.malhartech.annotation.PerformanceTestCategory.class)
  public void testNodeProcessing() throws Exception
  {
    MatchStringMap<String,String> oper = new MatchStringMap<String,String>();
    TestCountAndLastTupleSink matchSink = new TestCountAndLastTupleSink();
    oper.match.setSink(matchSink);
    oper.setKey("a");
    oper.setValue(3.0);
    oper.setTypeNEQ();

    oper.beginWindow(0);
    int numTuples = 10000000;
    HashMap<String, String> input1 = new HashMap<String, String>();
    HashMap<String, String> input2 = new HashMap<String, String>();
    input1.put("a", "2");
    input1.put("b", "20");
    input1.put("c", "1000");
    input2.put("a", "3");
    for (int i = 0; i < numTuples; i++) {
      oper.data.process(input1);
      oper.data.process(input2);
    }
    oper.endWindow();
    log.debug(String.format("\nBenchmark, processed %d tuples", numTuples * 4));
  }
}