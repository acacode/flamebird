var express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const storage = require('./storage')
const pw = require('./processWorker')

function start(taskfile, p, args) {
  const port = parseInt(p)
  var app = express()
  app.use(bodyParser.json())
  app.get('/', getIndexHtml)
  app.get('/commands', getCommands)
  app.post('/run-all', runAll)
  app.post('/stop-all', stopAll)
  app.post('/run/:command', runCommand)
  app.post('/stop/:command', stopCommand)
  app.use(express.static(__dirname + '/app')) // eslint-disable-line
  const server = http.createServer(app)

  require('./ws')(server)
  // start our server
  server.listen(port, function() {
    console.log('Server started on port ' + server.address().port)
  })
}

function getIndexHtml(req, res) {
    res.sendFile(__dirname + '/app/index.html') // eslint-disable-line
}

function getCommands(req, res) {
  res.send(storage.get('commands'))
}
function runAll(req, res) {
  pw.runAll(storage.get('commands'), storage.get('actionsArgs'))
  res.send('ok')
}
function stopAll(req, res) {
  pw.stopAll(storage.get('commands'), storage.get('actionsArgs'))
  res.send('ok')
}
function runCommand(req, res) {
  pw.run(req.params.command)
  res.send('ok')
}
function stopCommand(req, res) {
  pw.stop(req.params.command)
  res.send('ok')
}

module.exports.start = start
