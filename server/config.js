const program = require('commander')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const uuid = require('short-uuid')

const memCache = require('./utils/mem_cache')
const { getDataFromEnvFile } = require('./utils/envs')
const taskfile = require('./taskfile')

const RC_FILE_NAME = '.flamebirdrc'
const RC_FILE_PATH = path.resolve(__dirname, `../${RC_FILE_NAME}`)
const DEFAULT_CONFIG = {
  configs: [],
}

const getRC = () => {
  let config = {}
  try {
    config = JSON.parse(fs.readFileSync(RC_FILE_PATH))
    if (!config) {
      throw new Error("Wrong flamebird rc file. Let's create new")
    }
  } catch (e) {
    config = DEFAULT_CONFIG
    updateRC(config)
  }
  return config
}

const updateRC = rc => {
  // console.log('updateRC', rc)
  fs.writeFileSync(RC_FILE_PATH, JSON.stringify(rc))
}

const refreshRC = () => {
  console.log('refreshRC')
  const rc = getRC()
  memCache.set('rc-snapshot', rc)
  return rc
}

const createConfig = (
  {
    ignoreTrs,
    name,
    port,
    tasks,
    taskRunner,
    package: useOnlyPackageJson,
    withoutBrowser,
    sortByName,
  },
  isWeb
) => {
  const rc = getRC()

  console.log('createConfig')

  const config = {
    main: !rc.configs || !rc.configs.length,
    id: memCache.set('id', uuid.generate()),
    pid: process.pid,
    path: path.resolve(),
    withoutTaskRunner: !!ignoreTrs,
    name: name,
    port: +port,
    tasks: _.compact(_.split(tasks, /,/g)),
    taskRunner: taskRunner,
    useOnlyPackageJson: !!useOnlyPackageJson,
    web: !!isWeb,
    withoutBrowser: !!withoutBrowser,
    sortByName: !!sortByName,
    envs: getDataFromEnvFile(program.env),
  }

  if (config.web) {
    const rcSnapshot = memCache.set('rc-snapshot', {
      configs: [
        ...rc.configs,
        _.merge(config, {
          commands: taskfile.load(config, program.procfile),
        }),
      ],
    })
    updateRC({
      configs: _.map(rcSnapshot.configs, config => ({
        ...config,
        commands: _.map(config.commands, command =>
          _.merge(command, { logs: [] })
        ),
      })),
    })
  }

  return config
}

const findConfig = findHandler =>
  _.find(_.get(memCache.get('rc-snapshot'), 'configs', []), findHandler) || null

const getConfig = id => (id ? findConfig({ id }) : getMainConfig())

const getMainConfig = () => findConfig({ main: true })

const isMainConfig = () => memCache.get('config').main

const removeConfig = configId => {
  const rcSnapshot = memCache.get('rc-snapshot')
  const configIndex = rcSnapshot.configs.findIndex(
    config => configId === config.id
  )
  if (configIndex > -1) rcSnapshot.configs.splice(configIndex, 1)

  memCache.set('rc-snapshot', rcSnapshot)
  updateRC(rcSnapshot)
}

module.exports = {
  getRC,
  refreshRC,
  getMainConfig,
  getConfig,
  isMainConfig,
  createConfig,
  removeConfig,
  updateRC,
}
