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

'use strict';

var config = require('../config');
var kafka = require('kafka-node');
var LRU = require('lru-cache');
//var aggregatesMockData = require('./aggregatesMockData');
var aggregatesMockData = require('./mockData');

var Consumer = kafka.Consumer;
var Producer = kafka.Producer;
var Offset = kafka.Offset;
var Client = kafka.Client;
var topicOut = config.kafka.topic.out || 'test';
var connectionString = config.kafka.zookeeper;
var topicIn = config.kafka.topic.in || 'test';

var lruCache = LRU(config.kafka.lruCacheMax); // max number of queries

var client = new Client(connectionString);

var topicOutPartition = 0;

var options = {
  autoCommit: false,
  fromBeginning: false,
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 1024 * 1024,
  fromOffset: true
};

//TODO mock data
if (config.kafka.enableMockData) {
  lruCache.set(aggregatesMockData.id, {
    offset: -100,
    isMockData: true,
    value: JSON.stringify(aggregatesMockData)
  });
}

function createConsumer() {
  var offset = new Offset(client);

  var initialOffset;
  var done = false;

  function subscribe(consumer) {
    var count = 0;
    consumer.on('message', function (message) {
      count++;
      if (!done) {
        done = true;
        console.log('_initial message offset', message.offset);
        console.log('_offset difference', initialOffset - message.offset);
      }

      if (message.offset === initialOffset) {
        console.log('_messages received before initial offset ' + count);
      }

      if (message.offset >= initialOffset) {
        var msg = JSON.parse(message.value);
        //console.log('_msg ' + msg.id);
        lruCache.set(msg.id, message);
      }
    });
    consumer.on('error', function (err) {
      console.log('error', err);
    });
    consumer.on('offsetOutOfRange', function (topic) {
      console.log('__offsetOutOfRange');
      topic.maxNum = 2;
      offset.fetch([topic], function (err, offsets) {
        var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
        consumer.setOffset(topic.topic, topic.partition, min);
      });
    });
  }

  offset.fetch([
    { topic: topicOut, partition: topicOutPartition, time: Date.now(), maxNum: 1 }
  ], function (err, data) {
    if (data) {
      initialOffset = data[topicOut][0][0];
      console.log('__initial offset', initialOffset);

      var topics = [
        {topic: topicOut, partition: topicOutPartition, offset: initialOffset}
      ];
      var consumer = new Consumer(client, topics, options);
      subscribe(consumer);
    }
  });
}

createConsumer();

var producer = new Producer(client);

function send(message) {
  var payload = {topic: topicIn, messages: [message], partition: 0};
  producer.send([payload], function (err) {
    if (err) {
      console.log(arguments);
    }
  });
}

function devChangeValue(msg) {
  var value = JSON.parse(msg.value);
  //value.data.summaries[0].totalEvents += 10;
  value.data.summaries[3].totalEvents += 10010;
  value.data.summaries[4].totalEvents += 234634;
  msg.value = JSON.stringify(value);
}

function data(req, res) {
  var id = req.query.id;
  var cacheValue = lruCache.get(id);

  if (cacheValue && cacheValue.isMockData) {
    devChangeValue(cacheValue); //TODO for mock data only
  }

  res.json(cacheValue);
}

function publish(req, res) {
  var value = req.body;
  send(JSON.stringify(value));
  res.send(value);
}

exports.data = data;
exports.publish = publish;
