/* eslint-disable no-path-concat */
const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const opn = require('opn')
const os = require('os')
const _ = require('lodash')
const memCache = require('./utils/mem_cache')
const fs = require('fs')
const pw = require('./processWorker')
const { getCommandById } = require('./utils/commands')
const { PATHS, MESSAGE_TYPES } = require('./constants')
const { createWSConnection, sendMessage } = require('./ws')
const { getMainConfig } = require('./config')

function start(config) {
  if (!config.main) {
    const mainConfig = getMainConfig()
    http.request(
      {
        path: '/child-config-created',
        port: mainConfig.port,
        method: 'POST',
      },
      res => {
        res.resume()
        res.on('end', () => {
          if (res.complete)
            console.error(
              'The connection was terminated while the message was still being sent'
            )
          else console.log('Successfully')
          process.exit(0)
        })
      }
    )
    return
  }

  const app = express()

  app.use(bodyParser.json())
  app.use(express.static(path.resolve(__dirname, PATHS.WEB_APP_ROOT)))

  app.get('/', (req, res) =>
    res.sendFile(path.resolve(__dirname, PATHS.WEB_APP_ROOT))
  )

  app.get('/info', (req, res) => res.send(config))

  app.post('/run-all', (req, res) => {
    pw.runAll(memCache.get('commands'))

    res.send('ok')
  })

  app.post('/child-config-created', (req, res) => {
    console.log('FFFF')
    sendMessage(MESSAGE_TYPES.APPS_LIST_UPDATE, 'updated...')
  })

  app.post('/stop-all', (req, res) => {
    pw.stopAll(memCache.get('commands'))

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

  server.listen(config.port, '0.0.0.0', () => {
    console.log(`Flamebird launched on port ${config.port}`)
    if (!config.withoutBrowser)
      try {
        opn('http://localhost:' + config.port, {
          app: os.platform() === 'win32' ? 'chrome' : 'google-chrome',
        })
      } catch (e) {
        console.error('Cannot open Google Chrome browser')
      }
  })
}

module.exports.start = start
