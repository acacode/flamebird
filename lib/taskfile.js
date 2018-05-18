var fs = require('fs')
const _ = require('lodash')
const storage = require('./storage')
const splitStringOnEnvs = require('./envs').splitStringOnEnvs

/**
 * @typedef {Object} Command
 * @property {string} task
 * @property {Object} envs
 * @property {string} name
 */

function createCommand(name, commandData, uniqueId, isNPM) {
  const commandInfo = splitStringOnEnvs(commandData)
  return {
    task: commandInfo.string,
    envs: commandInfo.envs,
    name: name,
    logs: [],
    isRun: false,
    index: name + uniqueId,
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
    return createCommand(name, commands[name], index, isNPM)
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
                function(processes, command, taskName) {
                  if (_.includes(tasks, taskName)) {
                    processes[taskName] = command
                  }
                  return processes
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
            allCommands.push(createCommand(name, task, i + 'p', false))
          }
        }
      })
    } catch (e) {
      console.warn(
        'Procfile not found (or have some problems with parsing Procfile)'
      )
    }
  }
  return storage.set('commands', allCommands)
}

module.exports.load = load
