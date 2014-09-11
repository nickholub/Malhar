#!/bin/sh
export PORT=3003
export GATEWAY_HOST=localhost
export GATEWAY_PORT=9090
export MACHINE_REDIS_HOST=localhost
export MACHINE_REDIS_PORT=8379
export MACHINE_REDIS_DB_INDEX=2
export ADS_REDIS_HOST=localhost
export ADS_REDIS_PORT=4379
export ADS_REDIS_DB_INDEX=0
export MONGODB_HOST=localhost

export ZOOKEEPER=127.0.0.1:2181
export KAFKA_TOPIC_IN=AdsDemoQuery
export KAFKA_TOPIC_OUT=AdsDemoQueryResult
export MOCK_DATA=true

node app.js