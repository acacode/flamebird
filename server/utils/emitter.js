const events = require('events')

const emitter = new events.EventEmitter()

emitter.once('killall', signal =>
  console.log('Killing all processes with signal ', signal)
)

emitter.setMaxListeners(50)

module.exports = emitter
