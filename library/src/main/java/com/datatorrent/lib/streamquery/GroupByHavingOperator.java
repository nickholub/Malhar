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

import javax.validation.constraints.NotNull;

import com.datatorrent.api.BaseOperator;
import com.datatorrent.api.DefaultInputPort;
import com.datatorrent.api.DefaultOutputPort;
import com.datatorrent.api.annotation.OperatorAnnotation;
import com.datatorrent.lib.streamquery.condition.Condition;
import com.datatorrent.lib.streamquery.condition.HavingCondition;
import com.datatorrent.lib.streamquery.function.FunctionIndex;
import com.datatorrent.lib.streamquery.index.ColumnIndex;

/**
 * This operator provides sql group by query semantic on live data stream. <br>
 * Stream rows satisfying given select condition are processed by group by
 * column names and aggregate column function. <br>
 * If having condition is specified for aggregate index(s), it must also be
 * satisfied by row. HashMap of column name(s) and aggregate alias is emitted on
 * output port. <br>
 * <br>
 * <b>StateFull : Yes,</b> Operator aggregates input over application window. <br>
 * <b>Partitions : No, </b> will yield wrong result(s). <br>
 * <br>
 * <b>Ports</b>:<br>
 * <b> inport : </b> Input hash map(row) port, expects
 * HashMap&lt;String,Object&gt;<<br>
 * <b> outport : </b> Output hash map(row) port, emits
 * HashMap&lt;String,Object&gt;<br>
 * <br>
 * <b> Properties : <b> <br>
 * <b> condition : </b> Select condition for deleting rows. <br>
 * <b> columnGroupIndexes : </b> Group by names list. <br>
 * <b> indexes : </b> Select column indexes. <br>
 * <b> havingConditions : </b> Having filter conditions for aggregate(s). <br>
 * <br>
 *
 * @since 0.3.4
 */
@OperatorAnnotation(partitionable = false)
public class GroupByHavingOperator extends BaseOperator
{

  /**
   * aggregate indexes.
   */
  private ArrayList<FunctionIndex> aggregates = new ArrayList<FunctionIndex>();

  /**
   * Column, Group by names
   */
  private ArrayList<ColumnIndex> columnGroupIndexes = new ArrayList<ColumnIndex>();

  /**
   * where condition.
   */
  private Condition condition;

  /**
   * having aggregate condtion;
   */
  private ArrayList<HavingCondition> havingConditions = new ArrayList<HavingCondition>();

  /**
   * Table rows.
   */
  private ArrayList<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();

  public void addAggregateIndex(@NotNull FunctionIndex index)
  {
    aggregates.add(index);
  }

  public void addColumnGroupByIndex(@NotNull ColumnIndex index)
  {
    columnGroupIndexes.add(index);
  }
  public void addHavingCondition(@NotNull HavingCondition condition)
  {
    havingConditions.add(condition);
  }

  /**
   * @param set
   *          condition
   */
  public void setCondition(Condition condition)
  {
    this.condition = condition;
  }

  /**
   * Input port.
   */
  public final transient DefaultInputPort<Map<String, Object>> inport = new DefaultInputPort<Map<String, Object>>()
  {

    @Override
    public void process(Map<String, Object> tuple)
    {
      if ((condition != null) && (!condition.isValidRow(tuple)))
        return;
      rows.add(tuple);
    }
  };

  /**
   * Output port.
   */
  public final transient DefaultOutputPort<Map<String, Object>> outport = new DefaultOutputPort<Map<String, Object>>();

  /**
   * Create aggregate at end window.
   */
  @Override
  public void endWindow()
  {
    // group names
    if (columnGroupIndexes.size() == 0) {
      rows = new ArrayList<Map<String, Object>>();
      return;
    }

    // group rows
    HashMap<MultiKeyCompare, ArrayList<Map<String, Object>>> groups = new HashMap<MultiKeyCompare, ArrayList<Map<String, Object>>>();
    for (Map<String, Object> row : rows) {
      MultiKeyCompare key = new MultiKeyCompare();
      for (ColumnIndex index : columnGroupIndexes) {
        key.addCompareKey(row.get(index.getColumn()));
      }
      ArrayList<Map<String, Object>> subRows;
      if (groups.containsKey(key)) {
        subRows = groups.get(key);
      } else {
        subRows = new ArrayList<Map<String, Object>>();
        groups.put(key, subRows);
      }
      subRows.add(row);
    }

    // Iterate over groups and emit aggregate values
    for (Map.Entry<MultiKeyCompare, ArrayList<Map<String, Object>>> entry : groups
        .entrySet()) {
      ArrayList<Map<String, Object>> subRows = entry.getValue();

      // get result
      Map<String, Object> result = new HashMap<String, Object>();
      for (ColumnIndex index : columnGroupIndexes) {
        index.filter(subRows.get(0), result);
      }

      // append aggregate values
      for (FunctionIndex aggregate : aggregates) {
        try {
          aggregate.filter(subRows, result);
        } catch (Exception e) {
          e.printStackTrace();
        }
      }

      // check valid having aggregate
      boolean isValidHaving = true;
      for (HavingCondition condition : havingConditions) {
        try {
          isValidHaving &= condition.isValidAggregate(subRows);
        } catch (Exception e) {
          e.printStackTrace();
          return;
        }
      }
      if (isValidHaving)
        outport.emit(result);
    }

    rows = new ArrayList<Map<String, Object>>();
  }

  /**
   * multi key compare class.
   */
  @SuppressWarnings("rawtypes")
  private class MultiKeyCompare implements Comparable
  {

    /**
     * compare keys.
     */
    ArrayList<Object> compareKeys = new ArrayList<Object>();

    @Override
    public boolean equals(Object other)
    {
      if (other instanceof MultiKeyCompare)
        if (compareKeys.size() != ((MultiKeyCompare) other).compareKeys.size()) {
          return false;
        }
      for (int i = 0; i < compareKeys.size(); i++) {
        if (!(compareKeys.get(i).equals(((MultiKeyCompare) other).compareKeys
            .get(i)))) {
          return false;
        }
      }
      return true;
    }

    @Override
    public int hashCode()
    {
      int hashCode = 0;
      for (int i = 0; i < compareKeys.size(); i++) {
        hashCode += compareKeys.get(i).hashCode();
      }
      return hashCode;
    }

    @Override
    public int compareTo(Object other)
    {
      if (this.equals(other))
        return 0;
      return -1;
    }

    /**
     * Add compare key.
     */
    public void addCompareKey(Object value)
    {
      compareKeys.add(value);
    }
  }
}
