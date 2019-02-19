const WebSocket = require('ws')
const _ = require('lodash')
const uuidv1 = require('uuid/v1')

let sessions = {}

function create(server) {
  const ws = new WebSocket.Server({ server })
  ws.on('connection', session => {
    session.send(JSON.stringify({ status: 'ok' }))
    const sessionId = uuidv1()
    sessions[sessionId] = session

    session.on('close', () => {
      delete sessions[sessionId]
      session = null
    })
  })
}

function send(message) {
  _.each(
    sessions,
    session => session.readyState !== 3 && session.send(JSON.stringify(message))
  )
}

module.exports = {
  create: create,
  send: send,
}
