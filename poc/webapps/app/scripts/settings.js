window.settings = {};
settings.twitter = {};
settings.mobile = {};
settings.mobile.topic = {};
settings.machine = {};
settings.fraud = {};

settings.webSocketUrl = 'ws://localhost:3390/pubsub';
settings.appsURL = 'http://localhost:3390/static/#ops/apps/';

settings.twitter.appName = 'TwitterDevApplication';
settings.twitter.topic = 'demos.twitter.topURLs';
settings.mobile.topic.out = 'demos.mobiledev.phoneLocationQueryResult';
settings.mobile.topic.in = 'demos.mobiledev.phoneLocationQuery';
settings.mobile.appName = 'MobileDemoApplication';
settings.machine.appName = 'MachineData-DemoApplication';
settings.fraud.appName = 'Fraud-Detection-Demo-Application';
