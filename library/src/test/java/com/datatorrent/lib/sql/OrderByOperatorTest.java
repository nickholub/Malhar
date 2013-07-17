/*
 * Copyright (c) 2013 Malhar Inc. ALL Rights Reserved.
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
package com.datatorrent.lib.sql;

import java.util.HashMap;

import org.junit.Test;

import com.datatorrent.lib.testbench.CollectorTestSink;

/**
 *  Functional test for {@link com.datatorrent.lib.sql.OrderByOperatorTest}.
 */
public class OrderByOperatorTest
{
	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Test
  public void testSqlSelect()
  {
  	// craete operator   
    OrderByOperator oper = new OrderByOperator();
  	
  	CollectorTestSink sink = new CollectorTestSink();
  	oper.outport.setSink(sink);
  	oper.addOrderByRule(new OrderByRule<Integer>("b"));
  	oper.setDescending(true);
  	
  	oper.setup(null);
  	oper.beginWindow(1);
  	
  	HashMap<String, Object> tuple = new HashMap<String, Object>();
  	tuple.put("c", 2);
  	tuple.put("a", 0);
  	tuple.put("b", 1);
  	oper.inport.process(tuple);
  	
  	tuple = new HashMap<String, Object>();
  	tuple.put("a", 2);
  	tuple.put("b", 5);
  	tuple.put("c", 6);
  	oper.inport.process(tuple);
  	
  	tuple = new HashMap<String, Object>();
  	tuple.put("a", 2);
  	tuple.put("b", 6);
  	tuple.put("c", 6);
  	oper.inport.process(tuple);
  	
  	tuple = new HashMap<String, Object>();
  	tuple.put("a", 1);
  	tuple.put("b", 3);
  	tuple.put("c", 4);
  	oper.inport.process(tuple);
  	
  	tuple = new HashMap<String, Object>();
  	tuple.put("a", 1);
  	tuple.put("b", 4);
  	tuple.put("c", 4);
  	oper.inport.process(tuple);
  	
  	tuple = new HashMap<String, Object>();
  	tuple.put("a", 1);
  	tuple.put("b", 8);
  	tuple.put("c", 4);
  	oper.inport.process(tuple);
  	
  	oper.endWindow();
  	oper.teardown();
  	
  	System.out.println(sink.collectedTuples.toString());
  }
}