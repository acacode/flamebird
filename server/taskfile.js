const fs = require('fs')
const resolve = require('path').resolve
const _ = require('lodash')
const storage = require('./utils/storage')
const commands = require('./utils/commands')

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
 * @param {string} procfilePath
 * @param {object} args
 */
function load(procfilePath) {
  const options = storage.get('options')
  const allCommands = []
  if (options.web || options.useOnlyPackageJson) {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json').toString())
      storage.get('options').name = packageJson.name || 'flamebird'
      _.forEach(packageJson.scripts, (command, taskName) => {
        if (!options.tasks.length || _.includes(options.tasks, taskName)) {
          allCommands.push(commands.createCommand(taskName, command, 'npm'))
        }
      })
    } catch (e) {
      console.warn('package.json not found')
    }
  }
  if (options.web || !options.useOnlyPackageJson) {
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
          if (!options.tasks.length || _.includes(options.tasks, name)) {
            allCommands.push(commands.createCommand(name, task, 'procfile'))
          }
        }
      })
    } catch (e) {
      console.warn('Procfile not found')
    }
  }
  return storage.set('commands', updateCommands(allCommands))
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

function updateCommands(commands) {
  const options = storage.get('options')

  if (options.ignorePms) {
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
    const pms = {
      npm: 'npm run',
    }
    _.each(commands, command => {
      command.rawTask =
        command.type === 'procfile'
          ? command.task
          : `${pms[options.useAnotherPm] ||
              options.useAnotherPm ||
              command.type} ${command.name}`
    })
  }

  return options.sortByName ? _.sortBy(commands, 'name', 'asc') : commands
}

module.exports.load = load
