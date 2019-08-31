const fs = require('fs')
const resolve = require('path').resolve
const _ = require('lodash')
const commands = require('./utils/commands')
const { TASK_RUNNERS } = require('./constants')

let LIB_PATHS = null

const createLibPaths = () => {
  const [utilFormat, utilDir] =
    process.platform === 'win32'
      ? ['.cmd', 'node_modules\\.bin\\']
      : ['', 'node_modules/.bin/']
  LIB_PATHS = _.reduce(
    fs
      .readdirSync(resolve('node_modules/.bin'))
      .filter(file => !file.match(/.*\.cmd$/)),
    (bin, name) => (bin[name] = `${utilDir}${name}${utilFormat}`) && bin,
    {}
  )
}

/**
 * load task files (package.json or Procfile)
 * @param {object} config
 * @param {string} procfilePath
 */
function load(config, procfilePath) {
  const allCommands = []
  if (config.web || config.useOnlyPackageJson) {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json').toString())
      config.name = packageJson.name || 'flamebird'
      _.forEach(packageJson.scripts, (command, taskName) => {
        if (!config.tasks.length || _.includes(config.tasks, taskName)) {
          allCommands.push(commands.createCommand(taskName, command, 'npm'))
        }
      })
    } catch (e) {
      console.warn('package.json not found')
    }
  }
  if (config.web || !config.useOnlyPackageJson) {
    try {
      const data = fs.readFileSync(procfilePath)
      _.each(_.compact(data.toString().split(/[\n\r]/g)), (line, i) => {
        if (line && line[0] !== '#') {
          const tuple = /^([A-Za-z0-9_-]+):\s*(.+)$/m.exec(line)
          const name = tuple[1].trim()
          const task = tuple[2].trim()
          if (!name || !task) {
            throw new Error(
              'Syntax Error in Procfile, Line %d: No ' +
                (!tuple ? 'Procfile' : 'Command') +
                ' Found'
            )
          }
          if (!config.tasks.length || _.includes(config.tasks, name)) {
            allCommands.push(commands.createCommand(name, task, 'procfile'))
          }
        }
      })
    } catch (e) {
      console.warn('Procfile not found')
    }
  }
  return updateCommands(config, allCommands)
}

function setAbsolutePathsToTask(command, commandsWithoutPms) {
  const spaceChar = ' '
  const fixedTaskData = []
  const words = command.task.split(spaceChar)
  for (let x = 0; x < words.length; ) {
    const word = words[x]
    if (word === 'npm' || word === 'yarn') {
      const nextWordIsRun = words[x + 1] === 'run'
      const updatedCommand =
        commandsWithoutPms[words[x + (nextWordIsRun ? 2 : 1)]]
      if (updatedCommand) {
        fixedTaskData.push(updatedCommand)
        x += 2
      } else {
        fixedTaskData.push(word)
        x++
      }
    } else {
      fixedTaskData.push(LIB_PATHS[word] || word)
      x++
    }
  }
  return (command.rawTask = fixedTaskData.join(spaceChar))
}

function updateCommands(config, commands) {
  if (config.ignorePms) {
    if (LIB_PATHS === null) createLibPaths()
    _.reduce(
      _.sortBy(
        commands,
        ({ task }) => _.includes(task, 'yarn') || _.includes(task, 'npm')
      ),
      (commandsWithoutPms, command) => {
        command.task = _.replace(command.task, 'cross-env ', '')
        commandsWithoutPms[command.name] = setAbsolutePathsToTask(
          command,
          commandsWithoutPms
        )
        return commandsWithoutPms
      },
      {}
    )
  } else {
    const taskRunner =
      TASK_RUNNERS[`${config.taskRunner}`.toUpperCase()] || config.taskRunner
    _.each(commands, command => {
      command.rawTask =
        command.type === 'procfile'
          ? command.task
          : `${taskRunner || command.type} ${command.name}`
    })
  }

  return config.sortByName ? _.sortBy(commands, 'name', 'asc') : commands
}

module.exports.load = load
