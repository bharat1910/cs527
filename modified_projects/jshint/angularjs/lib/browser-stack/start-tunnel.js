/* jshint undef: true, unused: true */
var fs = require('fs');
var http = require('http');
var BrowserStackTunnel = require('browserstacktunnel-wrapper');

var HOSTNAME = 'localhost';
var PORTS = [9090, 9876];
var ACCESS_KEY = process.env.BROWSER_STACK_ACCESS_KEY;
var READY_FILE = process.env.SAUCE_CONNECT_READY_FILE;

// We need to start fake servers, otherwise the tunnel does not start.
var fakeServers = [];
var hosts = [];

PORTS.forEach(function(port) {
  fakeServers.push(http.createServer(function() {}).listen(port));
  hosts.push({
    name: HOSTNAME,
    port: port,
    sslFlag: 0
  });
});

var tunnel = new BrowserStackTunnel({
  key: ACCESS_KEY,
  hosts: hosts
});


tunnel.start(function(error) {
  console.log('** callback **')
  if (error) {
    console.error('Can not establish the tunnel', error);
  } else {
    console.log('Tunnel established.');
    fakeServers.forEach(function(server) {
      server.close();
    });

    if (READY_FILE) {
      fs.writeFile(READY_FILE, '');
    }
  }
});

tunnel.on('error', function(error) {
  console.error(error);
});