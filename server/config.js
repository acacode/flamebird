const program = require('commander')
const _ = require('lodash')
const path = require('path')
const uuidv1 = require('uuid/v1')

const fs = require('fs')

const rc = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../.flamebirdrc'))
)

const storage = require('./utils/storage')
const envs = require('./utils/envs')
const taskfile = require('./taskfile')

const updateRC = configChanges => {
  Object.assign(rc, configChanges)
  console.log('sss', rc)
  fs.writeFile(
    path.resolve(__dirname, '../.flamebirdrc'),
    JSON.stringify(rc),
    function(err) {
      if (err) return console.log(err)
      //   console.log(JSON.stringify(file))
      //   console.log('writing to ' + fileName)
    }
  )
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
  const config = {
    appId: uuidv1(),
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
  }

  storage.set('options', config)

  envs.load(program.env)

  const commands = taskfile.load(program.procfile)

  storage.set('options', {
    port: rc.port || port,
    configs: [
      ...rc.configs,
      _.merge(config, {
        commands,
      }),
    ],
  })

  updateRC(storage.get('options'))

  return {
    config,
    commands,
  }
}

module.exports = {
  createConfig,
  updateRC,
}
