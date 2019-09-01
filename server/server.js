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
const kill = require('tree-kill')
const { createWSConnection, sendMessage } = require('./ws')
const { getMainConfig, refreshRC, updateRC } = require('./config')

const rootPath = path.resolve(__dirname, PATHS.WEB_APP_ROOT)

function start(config) {
  console.log('Initializing web server')

  const app = express()

  app.use(bodyParser.json())
  app.use(express.static(rootPath))

  app.get('/', (req, res) => res.sendFile(rootPath))

  app.get('/info', (req, res) => {
    const rcSnapshot = memCache.get('rc-snapshot')

    res.send({
      ...rcSnapshot,
      configs: _.map(rcSnapshot.configs, config =>
        _.omit(config, 'pid', 'path')
      ),
    })
  })

  app.post('/child-config-created', (req, res) => {
    res.send('ok')
    const rc = refreshRC()
    const newConfig = rc.configs[rc.configs.length - 1]

    kill(newConfig.pid, 'SIGINT')
    sendMessage(MESSAGE_TYPES.APPS_LIST_UPDATE, { ok: true })

    return null
  })

  app.post('/:configId/:taskId/envs', (req, res) => {
    const { taskId, configId } = req.params
    const envs = req.body

    const currentCommand = getCommandById(configId, taskId)
    currentCommand.logs = []
    currentCommand.envs = envs

    pw.reRun(taskId)

    res.send('ok')
  })

  app.delete('/:configId/:taskId/logs', (req, res) => {
    const { taskId, configId } = req.params

    getCommandById(configId, taskId).logs = []

    res.send('ok')
  })

  app.get('/:configId/:taskId/logs', (req, res) => {
    const { taskId, configId } = req.params

    res.send(getCommandById(configId, taskId).logs)
  })

  app.get('/project-version', (req, res) => {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json').toString())
      res.send(packageJson.version || null)
    } catch (e) {
      res.send(null)
    }
  })

  app.post('/:configId/:taskId/run', (req, res) => {
    const { taskId, configId } = req.params

    const command = getCommandById(configId, taskId)

    pw.run(command)

    res.send('ok')
  })

  app.post('/:configId/:taskId/stop', (req, res) => {
    const { taskId, configId } = req.params
    
    const command = getCommandById(configId, taskId)

    pw.stop(command)

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

const update = config => {
  console.log('Try to connect to main flamebird process')

  const setConfigAsMain = () => {
    console.log('setConfigAsMain')
    updateRC(
      memCache.set('rc-snapshot', {
        configs: [
          _.merge(config, {
            main: true,
            commands: memCache.get('commands'),
          }),
        ],
      })
    )
    start(config)
  }

  const mainConfig = getMainConfig()

  if (!mainConfig) {
    setConfigAsMain()
    return
  }

  process.once('uncaughtException', setConfigAsMain)

  http
    .request(
      {
        timeout: 5000,
        host: '127.0.0.1',
        path: '/child-config-created',
        port: mainConfig.port,
        method: 'POST',
      },
      res => {
        res.resume()
        res.on('error', err => {
          console.log('TODO', err)
        })
        res.on('end', () => {
          console.log('Successfully connected')
          process.exit(0)
        })
      }
    )
    .end()
}

module.exports = {
  start,
  update,
}
