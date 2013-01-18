/**
 * Copyright (c) 2012-2012 Malhar, Inc. All rights reserved.
 */
package com.malhartech.lib.math;

import com.malhartech.api.Sink;
import com.malhartech.engine.Tuple;
import com.malhartech.lib.util.KeyValPair;
import java.util.ArrayList;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * Functional tests for {@link com.malhartech.lib.math.RangeKeyValue}<p>
 *
 */
public class RangeKeyValueBenchmark
{
  private static Logger log = LoggerFactory.getLogger(RangeKeyValueBenchmark.class);

  class TestSink implements Sink
  {
    double low = -1;
    double high = -1;

    @Override
    public void process(Object payload)
    {
      if (payload instanceof Tuple) {
      }
      else {
        KeyValPair<String, Object> tuple = (KeyValPair<String, Object>)payload;
        ArrayList<Number> alist = (ArrayList<Number>)tuple.getValue();
        high = alist.get(0).doubleValue();
        low = alist.get(1).doubleValue();
      }
    }
  }

  /**
   * Test functional logic
   */
  @Test
  @Category(com.malhartech.annotation.PerformanceTestCategory.class)
  public void testNodeProcessing()
  {
    testSchemaNodeProcessing(new RangeKeyValue<String, Integer>(), "integer"); // 8million/s  10.657s  29.809
    testSchemaNodeProcessing(new RangeKeyValue<String, Double>(), "double"); // 8 million/s 10.319
    testSchemaNodeProcessing(new RangeKeyValue<String, Long>(), "long"); // 8 million/s 10.654
    testSchemaNodeProcessing(new RangeKeyValue<String, Short>(), "short"); // 8 million/s 10.239s
    testSchemaNodeProcessing(new RangeKeyValue<String, Float>(), "float"); // 8 million/s 10.323s
  }

  /**
   * Test node logic emits correct results for each schema
   */
  public void testSchemaNodeProcessing(RangeKeyValue node, String type)
  {
    TestSink rangeSink = new TestSink();
    node.range.setSink(rangeSink);

    int numtuples = 100000000; // 100 millions
    if (type.equals("integer")) {
      KeyValPair<String, Integer> kv = new KeyValPair<String, Integer>("a", new Integer(0));
      for (int i = -10; i < numtuples; i++) {
        kv.setValue(new Integer(i));
        node.data.process(kv);
      }
    }
    else if (type.equals("double")) {
      KeyValPair<String, Double> kv = new KeyValPair<String, Double>("a", new Double(0.0));
      for (int i = -10; i < numtuples; i++) {
        kv.setValue(new Double(i));
        node.data.process(kv);
      }
    }
    else if (type.equals("long")) {
      KeyValPair<String, Long> kv = new KeyValPair<String, Long>("a", new Long(0));
      for (int i = -10; i < numtuples; i++) {
        kv.setValue(new Long(i));
        node.data.process(kv);
      }
    }
    else if (type.equals("short")) {
      short s = 0;
      KeyValPair<String, Short> kv = new KeyValPair<String, Short>("a", new Short(s));
      int count = numtuples / 1000; // cannot cross 64K
      for (int j = 0; j < count; j++) {
        for (short i = -10; i < 1000; i++) {
          kv.setValue(new Short(i));
          node.data.process(kv);
        }
      }
    }
    else if (type.equals("float")) {
      KeyValPair<String, Float> kv = new KeyValPair<String, Float>("a", new Float(0));
      for (int i = -10; i < numtuples; i++) {
        kv.setValue(new Float(i));
        node.data.process(kv);
      }
    }

    node.endWindow();
    log.debug(String.format("\n****************************\nThe high is %f, and low is %f from %d tuples of type %s\n*************************\n",
                            rangeSink.high, rangeSink.low, numtuples, type));
  }
}