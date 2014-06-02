/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
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
package com.datatorrent.demos.twitter;

import twitter4j.HashtagEntity;
import twitter4j.Status;

import com.datatorrent.api.BaseOperator;
import com.datatorrent.api.DefaultInputPort;
import com.datatorrent.api.DefaultOutputPort;

/**
 * <p>TwitterStatusHashtagExtractor class.</p>
 *
 */
public class TwitterStatusHashtagExtractor extends BaseOperator
{
  public final transient DefaultOutputPort<String> hashtags = new DefaultOutputPort<String>();
  public final transient DefaultInputPort<Status> input = new DefaultInputPort<Status>()
  {
    @Override
    public void process(Status status)
    {
      HashtagEntity[] entities = status.getHashtagEntities();
      if (entities != null) {
        for (HashtagEntity he : entities) {
          if (he != null) {
            hashtags.emit(he.getText());
          }
        }
      }
    }

  };
}
