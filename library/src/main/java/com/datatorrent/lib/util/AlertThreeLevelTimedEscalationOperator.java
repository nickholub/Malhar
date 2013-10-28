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

import com.datatorrent.api.annotation.OutputPortFieldAnnotation;

/**
 * Alert Escalation Operator intended for use with Alerts.
 *
 * @since 0.3.4
 */
public class AlertThreeLevelTimedEscalationOperator extends AlertEscalationOperator
{
  protected long levelOneAlertTime = 0;
  protected long levelTwoAlertTime = 0;
  protected long levelThreeAlertTime = 0;
  @OutputPortFieldAnnotation(name = "alert2", optional = true)
  public final transient AlertOutputPort<Object> alert2 = new AlertOutputPort<Object>();
  @OutputPortFieldAnnotation(name = "alert3", optional = true)
  public final transient AlertOutputPort<Object> alert3 = new AlertOutputPort<Object>();

  @Override
  public void processTuple(Object tuple)
  {
    if (inAlertSince >= levelOneAlertTime) {
      alert.emit(tuple);
    }
    if (inAlertSince >= levelTwoAlertTime) {
      alert2.emit(tuple);
    }
    if (inAlertSince >= levelThreeAlertTime) {
      alert3.emit(tuple);
    }
  }

  public long getLevelOneAlertTime()
  {
    return levelOneAlertTime;
  }

  public void setLevelOneAlertTime(long levelOneAlertTime)
  {
    this.levelOneAlertTime = levelOneAlertTime;
  }

  public long getLevelTwoAlertTime()
  {
    return levelTwoAlertTime;
  }

  public void setLevelTwoAlertTime(long levelTwoAlertTime)
  {
    this.levelTwoAlertTime = levelTwoAlertTime;
  }

  public long getLevelThreeAlertTime()
  {
    return levelThreeAlertTime;
  }

  public void setLevelThreeAlertTime(long levelThreeAlertTime)
  {
    this.levelThreeAlertTime = levelThreeAlertTime;
  }

}
