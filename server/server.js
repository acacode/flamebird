/* eslint-disable no-path-concat */
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const opn = require('opn')
const os = require('os')
const _ = require('lodash')
const storage = require('./utils/storage')
const fs = require('fs')
const pw = require('./processWorker')
const { getCommandById } = require('./utils/commands')
const { PATHS } = require('./constants')
const { createWSConnection } = require('./ws')

function start(taskfile) {
  const options = storage.get('options')
  const app = express()

  app.use(bodyParser.json())
  app.use(express.static(path.resolve(__dirname, PATHS.WEB_APP_ROOT)))

  app.get('/', (req, res) =>
    res.sendFile(path.resolve(__dirname, PATHS.WEB_APP_ROOT))
  )

  app.get('/info', (req, res) =>
    res.send(
      _.merge(options, {
        commands: _.map(storage.get('commands'), command =>
          _.omit(command, 'logs')
        ),
      })
    )
  )

  app.post('/run-all', (req, res) => {
    pw.runAll(storage.get('commands'))

    res.send('ok')
  })

  app.post('/stop-all', (req, res) => {
    pw.stopAll(storage.get('commands'))

    res.send('ok')
  })

  app.post('/update-envs', (req, res) => {
    const { id, envs } = req.body

    const currentCommand = getCommandById(id)
    currentCommand.logs = []
    currentCommand.envs = envs

    pw.reRun(id)

    res.send('ok')
  })

  app.post('/clear-logs/:taskId', (req, res) => {
    const { taskId } = req.params

    getCommandById(taskId).logs = []

    res.send('ok')
  })

  app.get('/logs/:taskId', (req, res) => {
    const { taskId } = req.params

    res.send(getCommandById(taskId).logs)
  })

  app.get('/project-version', (req, res) => {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json').toString())
      res.send(packageJson.version || null)
    } catch (e) {
      res.send(null)
    }
  })

  app.post('/run/:taskId', (req, res) => {
    const { taskId } = req.params

    pw.run(taskId)

    res.send('ok')
  })

  app.post('/stop/:taskId', (req, res) => {
    const { taskId } = req.params

    pw.stop(taskId)

    res.send('ok')
  })

  const server = http.createServer(app)

  createWSConnection(server)

  server.listen(options.port, '0.0.0.0', () => {
    console.log(`Flamebird launched on port ${options.port}`)
    if (!options.withoutBrowser)
      try {
        opn('http://localhost:' + options.port, {
          app: os.platform() === 'win32' ? 'chrome' : 'google-chrome',
        })
      } catch (e) {
        console.error('Cannot open Google Chrome browser')
      }
  })
}

module.exports.start = start
