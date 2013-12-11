window.settings = {};
settings.topic = {};
settings.hadoop = {};

settings.webSocketURL = 'ws://localhost:9090/pubsub';
//settings.webSocketURL = 'ws://' + window.location.host + '/sockjs/websocket';

settings.topic.job = 'contrib.summit.mrDebugger.jobResult';
settings.topic.map = 'contrib.summit.mrDebugger.mapResult';
settings.topic.reduce = 'contrib.summit.mrDebugger.reduceResult';

settings.hadoop.version = '2';
settings.hadoop.api = 'v1';
settings.hadoop.host = 'node0.morado.com';
settings.hadoop.resourceManagerPort = '8088';
settings.hadoop.historyServerPort = '19888';

