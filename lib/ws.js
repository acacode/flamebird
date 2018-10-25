const WebSocket = require('ws')
const _ = require('lodash')

let connections = {}
let connectionIDCounter = 0

function create(server) {
  const ws = new WebSocket.Server({ server })
  ws.on('connection', wc => {
    wc.send(JSON.stringify({ status: 'ok' }))
    let connection = wc
    // Store a reference to the connection using an incrementing ID
    connection.id = connectionIDCounter++
    connections[connection.id] = connection

    connection.on('close', function(reasonCode, description) {
      delete connections[connection.id]
      connection = null
    })
  })
}

function send(message) {
  _.forEach(connections, connection => {
    if (connection.readyState !== 3) {
      connection.send(JSON.stringify(message))
    }
  })
}

module.exports.create = create
module.exports.send = send
