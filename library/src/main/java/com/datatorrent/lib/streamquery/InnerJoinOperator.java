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
package com.datatorrent.lib.streamquery;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.datatorrent.api.Context.OperatorContext;
import com.datatorrent.api.DefaultInputPort;
import com.datatorrent.api.DefaultOutputPort;
import com.datatorrent.api.Operator;
import com.datatorrent.api.annotation.OperatorAnnotation;
import com.datatorrent.lib.streamquery.condition.Condition;
import com.datatorrent.lib.streamquery.index.Index;

/**
 * This operator reads table row data from 2 table data input ports. <br>
 * Operator joins row on given condition and selected names, emits
 * joined result at output port.
 *  <br>
 *  <b>StateFull : Yes,</b> Operator aggregates input over application window. <br>
 *  <b>Partitions : No, </b> will yield wrong result(s). <br>
 *  <br>
 *  <b>Ports : </b> <br>
 *  <b> inport1 : </b> Input port for table 1, expects HashMap&lt;String, Object&gt; <br>
 *  <b> inport1 : </b> Input port for table 2, expects HashMap&lt;String, Object&gt; <br>
 *  <b> outport : </b> Output joined row port, emits HashMap&lt;String, ArrayList&lt;Object&gt;&gt; <br>
 *  <br>
 *  <b> Properties : </b>
 *  <b> joinCondition : </b> Join condition for table rows. <br>
 *  <b> table1Columns : </b> Columns to be selected from table1. <br>
 *  <b> table2Columns : </b> Columns to be selected from table2. <br>
 *  <br>
 *
 * @since 0.3.3
 */
@OperatorAnnotation(partitionable = false)
public class InnerJoinOperator  implements Operator
{
	/**
	 * Join Condition; 
	 */
	protected Condition joinCondition;
	
	/**
	 * Table1 select columns.
	 */
	private ArrayList<Index> table1Columns = new ArrayList<Index>();
	
	/**
	 * Table2 select columns.
	 */
	private ArrayList<Index> table2Columns = new ArrayList<Index>();
	
  /**
   * Collect data rows from input port 1.
   */
	protected ArrayList<Map<String, Object>> table1;
	
	
	/**
	 * Collect data from input port 2. 
	 */
	protected ArrayList<Map<String, Object>> table2;
	
  /**
   * Input port 1.
   */
	public final transient DefaultInputPort<Map<String, Object>> inport1 = new DefaultInputPort<Map<String, Object>>() {
		@Override
		public void process(Map<String, Object> tuple)
		{
      table1.add(tuple);
      for (int j = 0; j < table2.size(); j++) {
        if ((joinCondition == null)
            || (joinCondition.isValidJoin(tuple, table2.get(j)))) {
          joinRows(tuple, table2.get(j));
        }
      }
		}
	};
	
	/**
	 * Input port 2. 
	 */
	public final transient DefaultInputPort<Map<String, Object>> inport2 = new DefaultInputPort<Map<String, Object>>() {
		@Override
		public void process(Map<String, Object> tuple)
		{
	    table2.add(tuple);
      for (int j = 0; j < table1.size(); j++) {
        if ((joinCondition == null)
            || (joinCondition.isValidJoin(table1.get(j), tuple))) {
          joinRows(table1.get(j), tuple);
        }
      }
		}
	};
	
	/**
	 * Output port.
	 */
	public final transient DefaultOutputPort<Map<String, Object>> outport =  
			new DefaultOutputPort<Map<String, Object>>();
	
	@Override
  public void setup(OperatorContext arg0)
  { 
  }

	@Override
  public void teardown()
  { 
  }

	@Override
  public void beginWindow(long arg0)
  { 
		table1 = new ArrayList<Map<String, Object>>();
		table2 = new ArrayList<Map<String, Object>>();
  }

	@Override
  public void endWindow()
  {
  }

	/**
   * @return the joinCondition
   */
  public Condition getJoinCondition()
  {
	  return joinCondition;
  }

	/**
   * @param set joinCondition
   */
  public void setJoinCondition(Condition joinCondition)
  {
	  this.joinCondition = joinCondition;
  }
  
  /**
   *  Select table1 column name.
   */
  public void selectTable1Column(Index column) {
  	table1Columns.add(column);
  }
  
  /**
   * Select table2 column name.
   */
  public void selectTable2Column(Index column) {
    table2Columns.add(column);
  }
  
  /**
   * Join row from table1 and table2.
   */
  protected void joinRows(Map<String, Object> row1, Map<String, Object> row2)
  {
    // joined row 
    Map<String, Object> join = new HashMap<String, Object>();
    
    // filter table1 columns  
    if (row1 != null) {
      for (Index index : table1Columns) {
        index.filter(row1, join);
      }
    }
    
    // filter table1 columns  
    if (row2 != null) {
      for (Index index : table2Columns) {
        index.filter(row2, join);
      }
    }
    
    // emit row  
    outport.emit(join);
  }
}
