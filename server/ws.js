const WebSocket = require('ws')
const _ = require('lodash')
const uuidv1 = require('uuid/v1')

const MESSAGE_TYPES = {
  CONNECTION: 'CONNECTION',
  LOG: 'LOG',
}

const sessions = {}

function createWSConnection(server) {
  const ws = new WebSocket.Server({ server })

  ws.on('connection', session => {
    sendMessageToSession(session, MESSAGE_TYPES.CONNECTION, { status: 'ok' })

    const sessionId = uuidv1()
    sessions[sessionId] = session

    session.on('close', () => {
      delete sessions[sessionId]
      session = null
    })
  })
}

const sendMessageToSession = (session, type, message) =>
  session.send(
    JSON.stringify({
      type,
      message,
    })
  )

function sendMessage(type, message) {
  _.each(sessions, session => {
    if (session.readyState !== 3) {
      sendMessageToSession(session, type, message)
    }
  })
}

module.exports = {
  create: createWSConnection,
  createWSConnection: createWSConnection,
  MESSAGE_TYPES: MESSAGE_TYPES,
  sendMessage: sendMessage,
  send: sendMessage,
}
