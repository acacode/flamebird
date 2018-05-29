const WebSocket = require('ws')

var ws = null

function create(server) {
  // initialize the WebSocket server instance
  // wss://localhost:PORT
  new WebSocket.Server({ server: server }).on('connection', _ws => {
    ws = _ws
    ws.send('{"status":"ok"}')
  })
}

function send(message) {
  if (ws.readyState !== 3) {
    ws.send(JSON.stringify(message))
  }
}

module.exports.create = create
module.exports.send = send
