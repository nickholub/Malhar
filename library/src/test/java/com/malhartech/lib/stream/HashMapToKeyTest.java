/**
 * Copyright (c) 2012-2012 Malhar, Inc. All rights reserved.
 */
package com.malhartech.lib.stream;

import com.malhartech.api.OperatorConfiguration;
import com.malhartech.dag.TestCountSink;
import java.util.HashMap;
import junit.framework.Assert;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Performance test for {@link com.malhartech.lib.testbench.StreamDuplicater}<p>
 * Benchmarks: Currently does about ?? Million tuples/sec in debugging environment. Need to test on larger nodes<br>
 * <br>
 */
public class HashMapToKeyTest {

    private static Logger log = LoggerFactory.getLogger(HashMapToKeyTest.class);


    /**
     * Test oper pass through. The Object passed is not relevant
     */
    @Test
    public void testNodeProcessing() throws Exception
    {
      HashMapToKey oper = new HashMapToKey();
      TestCountSink keySink = new TestCountSink();
      TestCountSink valSink = new TestCountSink();
      TestCountSink keyvalSink = new TestCountSink();

      oper.key.setSink(keySink);
      oper.val.setSink(valSink);
      oper.keyval.setSink(keyvalSink);
      oper.setup(new OperatorConfiguration());

      oper.beginWindow();
      HashMap<String,String> input = new HashMap<String,String>();
      input.put("a", "1");
      // Same input object can be used as the oper is just pass through
      int numtuples = 50000000;
      for (int i = 0; i < numtuples; i++) {
        oper.data.process(input);
      }

      oper.endWindow();

      Assert.assertEquals("number emitted tuples", numtuples, keySink.count);
      Assert.assertEquals("number emitted tuples", numtuples, valSink.count);
      Assert.assertEquals("number emitted tuples", numtuples, keyvalSink.count);
      log.debug(String.format("\n********************\nProcessed %d tuples\n********************\n",
                              keySink.count+valSink.count+keyvalSink.count));
    }
}
