const WebSocket = require('ws')

var ws = null

function init(server) {
  // initialize the WebSocket server instance
  const wss = new WebSocket.Server({ server: server })
  // wss://localhost:PORT
  wss.on('connection', function(_ws) {
    ws = _ws
    ws.on('message', function(message) {
      // log the received message and send it back to the client
      console.log('received: %s', message)
      ws.send(`Hello, you sent -> ${message}`)
    })

    // send immediatly a feedback to the incoming connection
    ws.send('{"status":"ok"}')
  })
}

function send(message) {
  ws.send(JSON.stringify(message))
}

module.exports = init
module.exports.send = send
