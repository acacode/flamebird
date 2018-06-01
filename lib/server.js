var express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const opn = require('opn')
const os = require('os')
const _ = require('lodash')
const storage = require('./storage')
const fs = require('fs')
const pw = require('./processWorker')
const connectToWebSocket = require('./ws').create

function start(taskfile, p, args) {
  const port = parseInt(p)
  var app = express()
  app.use(bodyParser.json())
  app.use(express.static(__dirname + '/app')) // eslint-disable-line
  app.get(
    '/',
    (req, res) => res.sendFile(__dirname + '/app/index.html') // eslint-disable-line
  )
  app.get('/info', (req, res) =>
    res.send({
      commands: _.map(storage.get('commands'), command => ({
        ...command,
        logs: [],
      })),
      appName: storage.get('actionArgs').name,
    })
  )
  app.post('/run-all', (req, res) => {
    pw.runAll(storage.get('commands'), storage.get('actionsArgs'))
    res.send('ok')
  })
  app.post('/stop-all', (req, res) => {
    pw.stopAll(storage.get('commands'), storage.get('actionsArgs'))
    res.send('ok')
  })
  app.post('/update-envs', (req, res) => {
    var currentCommand = pw.getCommandByName(req.body.name)
    currentCommand.logs = []
    currentCommand.envs = req.body.envs
    pw.reRun(req.body.name)
    res.send('ok')
  })
  app.post('/clear-logs/:command', (req, res) => {
    pw.getCommandByName(req.params.command).logs = []
    res.send('ok')
  })
  app.get('/logs/:command', (req, res) =>
    res.send(pw.getCommandByName(req.params.command).logs)
  )
  app.get('/project-version', (req, res) => {
    const packageJson = JSON.parse(fs.readFileSync('package.json').toString())
    res.send(packageJson.version || null)
  })
  app.post('/run/:command', (req, res) => {
    pw.run(req.params.command)
    res.send('ok')
  })
  app.post('/stop/:command', (req, res) => {
    pw.stop(req.params.command)
    res.send('ok')
  })
  const server = http.createServer(app)
  connectToWebSocket(server)
  server.listen(port, '0.0.0.0', () => {
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

module.exports.start = start
