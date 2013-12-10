window.settings = {};
settings.topic = {};

settings.webSocketURL = 'ws://localhost:9090/pubsub';
//settings.webSocketURL = 'ws://' + window.location.host + '/sockjs/websocket';
settings.topic.job = 'contrib.summit.mrDebugger.jobResult';
settings.topic.map = 'contrib.summit.mrDebugger.mapResult';
settings.topic.reduce = 'contrib.summit.mrDebugger.reduceResult';
