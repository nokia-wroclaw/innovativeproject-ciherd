# CI-Herd
[![Build Status](https://travis-ci.org/nokia-wroclaw/innovativeproject-ciherd.svg?branch=master)](https://travis-ci.org/nokia-wroclaw/innovativeproject-ciherd)
[![Code Climate](https://codeclimate.com/github/nokia-wroclaw/innovativeproject-ciherd/badges/gpa.svg)](https://codeclimate.com/github/nokia-wroclaw/innovativeproject-ciherd)

Single web application for multiple Jenkins servers managing.

### Version
1.0.0

### Tech
CI-Herd uses a number of open source projects to work properly:
* [MongoDB] - document database, and the leading NoSQL database
* [Express] - fast node.js network app framework
* [AngularJS] - HTML enhanced for web apps!
* [Node.js] - evented I/O for the backend
* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [Socket.IO] - real-time bidirectional event-based communication

### Requirements
Our software requires following programs:
* [Git](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git) -  distributed revision control
* [NodeJS](http://nodejs.org/download/) - runtime environment for server-side applications
* [MongoDB](http://docs.mongodb.org/manual/installation/) -  document-oriented database
* [NPM](https://github.com/npm/npm#super-easy-install) - package manager for javascript
* [Bower](https://github.com/bower/bower#install) - package manager for the web

### Installation
```sh
$ git clone git@github.com:nokia-wroclaw/innovativeproject-ciherd.git ciherd
$ cd ciherd
$ npm install
$ bower install
```
### Usage
To run ciherd:
```sh
$ grunt serve
```

To run tests (mocha + karmaJS):
```sh
$ grunt test
```

### Authors
* Mateusz Sołtysik ([@msoltysik])
* Mikołaj Rydecki ([@mrydecki])
* Andrzej Kwak ([@akwak])

License
----

MIT
[Node.js]:http://nodejs.org
[Twitter Bootstrap]:http://twitter.github.com/bootstrap/
[jQuery]:http://jquery.com
[express]:http://expressjs.com
[AngularJS]:http://angularjs.org
[Socket.IO]:http://socket.io/
[MongoDB]:http://www.mongodb.org/
[@msoltysik]:https://github.com/msoltysik/
[@mrydecki]:https://github.com/mrydecki/
[@akwak]:https://github.com/akwak/
