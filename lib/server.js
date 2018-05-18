var express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const opn = require('opn')
const os = require('os')
const _ = require('lodash')
const storage = require('./storage')
const fs = require('fs')
const pw = require('./processWorker')

function start(taskfile, p, args) {
  const port = parseInt(p)
  var app = express()
  app.use(bodyParser.json())
  app.get('/', getIndexHtml)
  app.get('/info', getInfo)
  app.post('/run-all', runAll)
  app.post('/stop-all', stopAll)
  app.post('/update-envs', updateEnvs)
  app.post('/clear-logs/:command', clearLogs)
  app.get('/logs/:command', getLogs)
  app.get('/project-version', getProjectVersion)
  app.post('/run/:command', runCommand)
  app.post('/stop/:command', stopCommand)
  app.use(express.static(__dirname + '/app')) // eslint-disable-line
  const server = http.createServer(app)
  require('./ws').create(server)
  server.listen(port, '0.0.0.0', function() {
    const port = server.address().port
    console.log('Server started on port ' + port)
    try {
      opn('http://localhost:' + port, {
        app: os.platform() === 'win32' ? 'chrome' : 'google-chrome',
      })
    } catch (e) {
      console.error('Cannot open Google Chrome browser')
    }
  })
}

function getIndexHtml(req, res) {
    res.sendFile(__dirname + '/app/index.html') // eslint-disable-line
}

function getInfo(req, res) {
  res.send({
    commands: _.cloneDeep(storage.get('commands')),
    appName: storage.get('actionArgs').name,
  })
}
function updateEnvs(req, res) {
  var currentCommand = pw.getCommandByName(req.body.name)
  currentCommand.logs = []
  currentCommand.envs = req.body.envs
  pw.reRun(req.body.name)
  res.send('ok')
}
function runAll(req, res) {
  pw.runAll(storage.get('commands'), storage.get('actionsArgs'))
  res.send('ok')
}
function stopAll(req, res) {
  pw.stopAll(storage.get('commands'), storage.get('actionsArgs'))
  res.send('ok')
}
function getProjectVersion(req, res) {
  const packageJson = JSON.parse(fs.readFileSync('package.json').toString())
  res.send(packageJson.version || null)
}
function clearLogs(req, res) {
  pw.getCommandByName(req.params.command).logs = []
  res.send('ok')
}
function getLogs(req, res) {
  res.send(pw.getCommandByName(req.params.command).logs)
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
