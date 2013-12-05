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
package com.datatorrent.lib.util;

import com.datatorrent.api.DefaultOutputPort;
import com.datatorrent.api.Context.OperatorContext;
import com.datatorrent.api.Operator.Unifier;

import java.util.HashMap;
import java.util.Map;

/**
 *
 * Combiner for an output port that emits object with Map<K,ArrayList<V>(2)> interface and has the processing done
 * with round robin partition. The first element in the ArrayList is high, the next is low
 *
 * @since 0.3.2
 */
public class UnifierKeyValRange<K, V extends Number> implements Unifier<KeyValPair<K, HighLow<V>>>
{
  public final transient DefaultOutputPort<KeyValPair<K, HighLow<V>>> mergedport = new DefaultOutputPort<KeyValPair<K, HighLow<V>>>();

  /**
   * combines the tuple into a single final tuple which is emitted in endWindow
   * @param tuple incoming tuple from a partition
   */
  @Override
  public void process(KeyValPair<K, HighLow<V>> tuple)
  {
    HighLow<V> val = map.get(tuple.getKey());
    if (val == null) {
      val = new HighLow(tuple.getValue().getHigh(), tuple.getValue().getLow());
    }

    if (val.getHigh().doubleValue() < tuple.getValue().getHigh().doubleValue()) {
      val.setHigh(tuple.getValue().getHigh());
    }
    if (val.getLow().doubleValue() > tuple.getValue().getLow().doubleValue()) {
      val.setLow(tuple.getValue().getLow());
    }
  }

  HashMap<K, HighLow<V>> map = new HashMap<K, HighLow<V>>();

  /**
   * a no op
   * @param windowId
   */
  @Override
  public void beginWindow(long windowId)
  {
  }


  /**
   * emits mergedTuple on mergedport if it is not empty
   */
  @SuppressWarnings({ "unchecked", "rawtypes" })
  @Override
  public void endWindow()
  {
    if (!map.isEmpty()) {
      for (Map.Entry<K, HighLow<V>> e: map.entrySet()) {
        mergedport.emit(new KeyValPair(e.getKey(), new HighLow(e.getValue().getHigh(), e.getValue().getLow())));
      }
      map.clear();
    }
  }

  /**
   * a no-op
   * @param context
   */
  @Override
  public void setup(OperatorContext context)
  {
  }

  /**
   * a noop
   */
  @Override
  public void teardown()
  {
  }
}
