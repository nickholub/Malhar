window.settings = {};
settings.twitter = {};
settings.mobile = {};
settings.mobile.topic = {};
settings.machine = {};
settings.machine.range = {};
settings.fraud = {};

settings.webSocketUrl = 'ws://localhost:9090/pubsub';
settings.appsURL = 'http://localhost:9090/static/#ops/apps/';

settings.twitter.appName = 'TwitterCustomerApplication';
settings.twitter.topic = 'demos.twitter.topURLs';
settings.mobile.topic.out = 'demos.mobile.phoneLocationQueryResult';
settings.mobile.topic.in = 'demos.mobile.phoneLocationQuery';
settings.mobile.appName = 'MobileLocatorCustomerApplication';
settings.machine.appName = 'MachineDataCustomerApplication';
settings.machine.lookback = 180; // default lookback (minutes)
settings.machine.metricformat = '#.0';
settings.machine.pollInterval = 1000;
settings.machine.range.customer = { start: 1, stop: 10 };
settings.machine.range.product = { start: 4, stop: 6 };
settings.machine.range.os = { start: 10, stop: 12 };
settings.machine.range.software1 = { start: 10, stop: 12 };
settings.machine.range.software2 = { start: 12, stop: 14 };
settings.machine.range.deviceId = { start: 1, stop: 50 };
settings.fraud.appName = 'FraudDetectionCustomerApplication';
