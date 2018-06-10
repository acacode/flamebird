var fs = require('fs')
const resolve = require('path').resolve
const _ = require('lodash')
const storage = require('./storage')
const splitStringOnEnvs = require('./envs').splitStringOnEnvs

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
 * @typedef {Object} Command
 * @property {string} task
 * @property {Object} envs
 * @property {string} name
 */

let commandCounter = 0
function createCommand(name, commandData, isNPM) {
  const commandInfo = splitStringOnEnvs(commandData)
  return {
    task: commandInfo.string,
    envs: commandInfo.envs,
    name: name,
    logs: [],
    isRun: false,
    index: name + commandCounter++,
    isNPM: !!isNPM,
  }
}

/**
 *
 *
 * @param {any} commands
 * @returns {Command[]}
 */
function parseCommands(commands, isNPM) {
  return _.map(_.keys(commands), function(name, index) {
    return createCommand(name, commands[name], isNPM)
  })
}
function load(filename, args) {
  const tasks = args.tasks && args.tasks.split(',')
  let allCommands = []
  if (args.web || args.package) {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json').toString())
      storage.get('actionArgs').name = packageJson.name || 'flamebird'
      _.merge(
        allCommands,
        parseCommands(
          tasks
            ? _.reduce(
                packageJson.scripts,
                function(commands, command, taskName) {
                  if (_.includes(tasks, taskName)) {
                    commands[taskName] = command
                  }
                  return commands
                },
                {}
              )
            : packageJson.scripts,
          true
        )
      )
    } catch (e) {
      throw new Error(
        "Failed to parse package.json file in your directory. May be package.json has invalid format or hasn't 'scripts' property?"
      )
    }
  }
  if (args.web || !args.package) {
    try {
      var data = fs.readFileSync(filename)
      _.each(_.compact(data.toString().split(/[\n\r]/g)), function(line, i) {
        if (line && line[0] !== '#') {
          var tuple = /^([A-Za-z0-9_-]+):\s*(.+)$/m.exec(line)
          var name = tuple[1].trim()
          var task = tuple[2].trim()
          if (!name || !task) {
            throw new Error(
              'Syntax Error in Procfile, Line %d: No ' +
                (!tuple ? 'Procfile' : 'Command') +
                ' Found'
            )
          }
          if (!tasks || _.includes(tasks, tuple)) {
            allCommands.push(createCommand(name, task, false))
          }
        }
      })
    } catch (e) {
      console.warn('Procfile not found')
    }
  }
  return storage.set('commands', updateCommands(allCommands))
}

function fixNpmOrYarnTask(i, word, rawTasks, words, updatedWords) {
  const nextWordIsRun = words[i + 1] === 'run'
  const updatedCommand = rawTasks[words[i + (nextWordIsRun ? 2 : 1)]]
  if (updatedCommand) {
    updatedWords.push(updatedCommand)
    i += nextWordIsRun ? 2 : 1
  } else {
    updatedWords.push(word)
  }
}

function addRawTaskData(task, rawTasks) {
  const spaceChar = ' '
  let fixedTaskData = []
  const words = task.task.split(spaceChar)
  _.forEach(words, (word, index) => {
    if (word === 'npm' || word === 'yarn') {
      fixNpmOrYarnTask(index, word, rawTasks, words, fixedTaskData)
    } else {
      fixedTaskData.push(LIB_PATHS[word] || word)
    }
  })
  return (task.rawTask = fixedTaskData.join(spaceChar))
}

function updateCommands(commands) {
  if (LIB_PATHS === null) createLibPaths()
  let updatedCommands = _.sortBy(
    commands,
    c => c.task.includes('yarn') || c.task.includes('npm')
  )
  _.reduce(
    updatedCommands,
    (pathTasks, task) =>
      (pathTasks[task.name] = addRawTaskData(task, pathTasks)) && pathTasks,
    {}
  )
  return updatedCommands
}

module.exports.load = load
