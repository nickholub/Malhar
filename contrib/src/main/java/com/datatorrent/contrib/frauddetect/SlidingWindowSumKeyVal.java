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
package com.datatorrent.contrib.frauddetect;

import com.datatorrent.api.Context.OperatorContext;
import com.datatorrent.api.DefaultOutputPort;
import com.datatorrent.api.annotation.OutputPortFieldAnnotation;
import com.datatorrent.lib.multiwindow.AbstractSlidingWindowKeyVal;
import com.datatorrent.lib.multiwindow.SlidingWindowObject;
import com.datatorrent.lib.util.KeyValPair;
import java.util.ArrayList;
import org.apache.commons.lang.mutable.MutableDouble;

/**
 * Sliding window sum operator
 *
 * @since 0.9.0
 */
public class SlidingWindowSumKeyVal<K, V extends Number> extends AbstractSlidingWindowKeyVal<K, V, SlidingWindowSumObject>
{

  	/**
	 * Output port to emit simple moving average (SMA) of last N window as Double.
	 */
	@OutputPortFieldAnnotation(name = "doubleSum", optional = true)
	public final transient DefaultOutputPort<KeyValPair<K, Double>> doubleSum = new DefaultOutputPort<KeyValPair<K, Double>>();
	/**
	 * Output port to emit simple moving average (SMA) of last N window as Float.
	 */
	@OutputPortFieldAnnotation(name = "floatSum", optional = true)
	public final transient DefaultOutputPort<KeyValPair<K, Float>> floatSum = new DefaultOutputPort<KeyValPair<K, Float>>();
	/**
	 * Output port to emit simple moving average (SMA) of last N window as Long.
	 */
	@OutputPortFieldAnnotation(name = "longSum", optional = true)
	public final transient DefaultOutputPort<KeyValPair<K, Long>> longSum = new DefaultOutputPort<KeyValPair<K, Long>>();
	/**
	 * Output port to emit simple moving average (SMA) of last N window as
	 * Integer.
	 */
	@OutputPortFieldAnnotation(name = "integerSum", optional = true)
	public final transient DefaultOutputPort<KeyValPair<K, Integer>> integerSum = new DefaultOutputPort<KeyValPair<K, Integer>>();


  @Override
  public void processDataTuple(KeyValPair<K, V> tuple)
  {
    K key = tuple.getKey();
    ArrayList<SlidingWindowSumObject> stateList = buffer.get(key);
    if (stateList == null) {
      stateList = new ArrayList<SlidingWindowSumObject>();
      for (int i = 0; i < windowSize; ++i) {
        stateList.add(new SlidingWindowSumObject());
      }
      buffer.put(key, stateList);
    }

    SlidingWindowSumObject state = stateList.get(currentstate);
    state.add(tuple.getValue());
  }

  @Override
  public void emitTuple(K key, ArrayList<SlidingWindowSumObject> obj)
  {
    double sum = 0;
    for (int i=0; i < obj.size(); ++i) {
      SlidingWindowSumObject state = obj.get(i);
      sum += state.getSum();
    }
    if (doubleSum.isConnected()) {
      doubleSum.emit(new KeyValPair<K, Double>(key, sum));
    }
    if (floatSum.isConnected()) {
      floatSum.emit(new KeyValPair<K, Float>(key, (float) sum));
    }
    if (longSum.isConnected()) {
      longSum.emit(new KeyValPair<K, Long>(key, (long) sum));
    }
    if (integerSum.isConnected()) {
      integerSum.emit(new KeyValPair<K, Integer>(key, (int) sum));
    }
  }

}
