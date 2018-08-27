const WebSocket = require('ws');
const streamer = require('./streamer');

const wss = new WebSocket.Server({ port: 8080 });
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(
    client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    }
  );
};

streamer.on('data', wss.broadcast);

module.exports = wss;
