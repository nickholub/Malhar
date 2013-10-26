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
package com.datatorrent.lib.script;

import java.util.HashMap;
import java.util.Map;

import junit.framework.Assert;

import org.junit.Test;

import com.datatorrent.lib.script.PythonOperator;
import com.datatorrent.lib.testbench.CollectorTestSink;
import org.python.core.PyInteger;

/**
 * Unit test for PythonOperator.
 *
 */
public class PythonOperatorTest
{
  @SuppressWarnings({"rawtypes", "unchecked"})
  @Test
  public void testJavaOperator()
  {
    PythonOperator oper = new PythonOperator();
    String setupScript = "import operator\n";
    setupScript += "def square():\n";
    setupScript += "  return val*val\n\n";
    oper.addSetupScript(setupScript);
    oper.setScript("square()");
    oper.setPassThru(true);

    CollectorTestSink sink = new CollectorTestSink();
    oper.result.setSink(sink);
    HashMap<String, Object> tuple = new HashMap<String, Object>();
    tuple.put("val", new Integer(2));
    oper.setup(null);
    oper.beginWindow(0);
    oper.inBindings.process(tuple);
    oper.endWindow();

    Assert.assertEquals("number emitted tuples", 1, sink.collectedTuples.size());
    for (Object o : sink.collectedTuples) {
      PyInteger val = (PyInteger)o;
      Assert.assertEquals("emitted should be 4", new Integer(4),
                          (Integer)val.__tojava__(Integer.class));
    }
  }

}
