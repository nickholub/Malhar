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
package com.datatorrent.lib.math;

import com.datatorrent.api.DefaultInputPort;
import com.datatorrent.api.DefaultOutputPort;
import com.datatorrent.api.annotation.InputPortFieldAnnotation;
import com.datatorrent.api.annotation.OperatorAnnotation;
import com.datatorrent.api.annotation.OutputPortFieldAnnotation;
import com.datatorrent.lib.util.BaseNumberValueOperator;

/**
 * <p>
 * Adds all the values on "numerator" and "denominator" and emits quotient at
 * end of window. <br>
 * Application can set multiply by value for quotient. <br>
 * <br>
 * <b>StateFull : Yes </b>, Values are sumed over application window. <br>
 * <b>Partitions : No </b>, will yield wrong results, since values are
 * accumulated over application window. <br>
 * <br>
 * <b>Ports</b>:<br>
 * <b>numerator</b>: expects V extends Number<br>
 * <b>denominator</b>: expects V extends Number<br>
 * <b>quotient</b>: emits Double<br>
 * <br>
 * <b>Properties : </b> <br>
 * <b>mult_by : </b>Multiply by value(default = 1). <br>
 * <br>
 *
 * @since 0.3.3
 */
@OperatorAnnotation(partitionable = false)
public class Quotient<V extends Number> extends BaseNumberValueOperator<V>
{
	protected double nval = 0.0;
	protected double dval = 0.0;
	int mult_by = 1;

	/**
	 * Numerator values port.
	 */
	@InputPortFieldAnnotation(name = "numerator")
	public final transient DefaultInputPort<V> numerator = new DefaultInputPort<V>()
	{
		/**
		 * Adds to the numerator value
		 */
		@Override
		public void process(V tuple)
		{
			nval += tuple.doubleValue();
		}
	};

	/**
	 * Denominator values port.
	 */
	@InputPortFieldAnnotation(name = "denominator")
	public final transient DefaultInputPort<V> denominator = new DefaultInputPort<V>()
	{
		/**
		 * Adds to the denominator value
		 */
		@Override
		public void process(V tuple)
		{
			dval += tuple.doubleValue();
		}
	};

	/**
	 * Quotient output port.
	 */
	@OutputPortFieldAnnotation(name = "quotient")
	public final transient DefaultOutputPort<V> quotient = new DefaultOutputPort<V>();

	public void setMult_by(int i)
	{
		mult_by = i;
	}

	/**
	 * Generates tuple emits it as long as denominator is not 0. Clears internal
	 * data
	 */
	@Override
	public void endWindow()
	{
		if (dval == 0) {
			return;
		}
		double val = (nval / dval) * mult_by;
		quotient.emit(getValue(val));
		nval = 0.0;
		dval = 0.0;
	}
}
