const program = require('commander')
const _ = require('lodash')
const path = require('path')
const uuidv1 = require('uuid/v1')

const fs = require('fs')

const CONFIG_NAME = '.flamebirdrc'
const CONFIG_PATH = path.resolve(__dirname, `../${CONFIG_NAME}`)
const DEFAULT_CONFIG = {
  port: 0,
  configs: [],
}

const memCache = require('./utils/mem_cache')
const envs = require('./utils/envs')
const taskfile = require('./taskfile')

const getRC = () => {
  let config = {}
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH))
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
  console.log('updateRC', rc)
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(rc))
}

const createConfig = (
  {
    ignorePms,
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

  const config = memCache.set('config', {
    main: !rc.configs || !rc.configs.length,
    appId: memCache.set('appId', uuidv1()),
    path: path.resolve(),
    ignorePms: !!ignorePms,
    name: name,
    port: +port,
    tasks: _.compact(_.split(tasks, /,/g)),
    taskRunner: taskRunner,
    useOnlyPackageJson: !!useOnlyPackageJson,
    web: !!isWeb,
    withoutBrowser: !!withoutBrowser,
    sortByName: !!sortByName,
  })

  envs.load(program.env)

  const commands = memCache.set(
    'commands',
    taskfile.load(config, program.procfile)
  )

  updateRC(
    memCache.set('rc-snapshot', {
      configs: [
        ...rc.configs,
        _.merge(config, {
          commands,
        }),
      ],
    })
  )

  return {
    config,
    commands,
  }
}

const findConfig = findHandler =>
  _.find(_.get(memCache.get('rc-snapshot'), 'configs', []), findHandler) || {}

const getConfig = id => (id ? findConfig({ id }) : memCache.get('config'))

const getMainConfig = () => findConfig({ main: true })

const isMainConfig = () => memCache.get('config').main

module.exports = {
  getMainConfig,
  getConfig,
  isMainConfig,
  createConfig,
  updateRC,
}
