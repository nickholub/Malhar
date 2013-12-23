Map Reduce Monitor
===============

Map Reduce Monitor Web Application. Implemented with [Node.js](http://nodejs.org/) and [AngularJS](http://angularjs.org/).

## Configuration
 config.js has application configuration. WebSocket URL is ws://gateway_hostname:gateway_port/pubsub
 Minimum required configuration:

 - Hadoop ResourceManager

 - Haddop History Server

 - WebSocket URL (DataTorrent Gateway address)

## Prerequisites

  The following should be running:

  - Map Reduce Monitor Java Application

  - DataTorrent Gateway


## Running Application in Production Mode

 1. Install Node.js.

 2. Install npm dependencies

    $ npm install

 3. Install forever tool

    $ npm install -g forever

 4. Start Node.js Server (see prod.sh)

    $ NODE_ENV=production PORT=3000 forever start app.js

## Running Application in Development Mode
 Install dependencies:

    $ npm install

 Install Bower dependencies:

    $ bower install

 Start Node.js server:

    $ node app

 Application will be available at http://localhost:3000

## Building Application

 Application is built with Grunt (it creates dist folder used in production mode).

    $ npm install -g grunt-cli

    $ grunt

## Tips

 Running Node.js as a daemon with [forever](https://github.com/nodejitsu/forever)

    $ npm install forever -g
    $ forever start app.js
    $ forever list
    $ forever stop <uid>

 Running Node.js on different port

    $ PORT=3001 node app

## Links

[Node.js](http://nodejs.org/) Software platform built on JavaScript runtime

[Express](https://github.com/visionmedia/express) Node.js web framework

[forever](https://github.com/nodejitsu/forever) Node.js daemon/continuous running/fault tolerance

[AngularJS](http://angularjs.org/) JavaScript framework

[Bower](http://bower.io/) Package manager for the web

[Grunt](http://gruntjs.com/) JavaScript Task Runner