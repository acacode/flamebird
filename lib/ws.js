const WebSocket = require('ws')
const _ = require('lodash')
const uuidv1 = require('uuid/v1')

let connections = {}

function create(server) {
  const ws = new WebSocket.Server({ server })
  ws.on('connection', wc => {
    wc.send(JSON.stringify({ status: 'ok' }))
    let connection = wc
    const sessionId = uuidv1()
    connections[sessionId] = connection

    connection.on('close', () => {
      delete connections[sessionId]
      connection = null
    })
  })
}

function send(message) {
  _.each(
    connections,
    ({ readyState, send }) => readyState !== 3 && send(JSON.stringify(message))
  )
}

module.exports = {
  create: create,
  send: send,
}
