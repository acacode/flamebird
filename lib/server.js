var express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const opn = require('opn')
const storage = require('./storage')
const pw = require('./processWorker')

function start(taskfile, p, args) {
  const port = parseInt(p)
  var app = express()
  app.use(bodyParser.json())
  app.get('/', getIndexHtml)
  app.get('/info', getInfo)
  app.post('/run-all', runAll)
  app.post('/stop-all', stopAll)
  app.post('/run/:command', runCommand)
  app.post('/stop/:command', stopCommand)
  app.use(express.static(__dirname + '/app')) // eslint-disable-line
  const server = http.createServer(app)
  require('./ws')(server)
  server.listen(port, function() {
    const port = server.address().port
    console.log('Server started on port ' + port)
    opn('http://localhost:' + port, { app: 'chrome' })
  })
}

function getIndexHtml(req, res) {
    res.sendFile(__dirname + '/app/index.html') // eslint-disable-line
}

function getInfo(req, res) {
  res.send({
    commands: storage.get('commands'),
    appName: storage.get('actionArgs').name,
  })
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
