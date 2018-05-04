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

/**
 *
 *
 * @param {any} commands
 * @returns {Command[]}
 */
function parseCommands(commands, isNpmCommand) {
  return _.map(_.keys(commands), function(name, index) {
    const command = commands[name]
    const commandInfo = splitStringOnEnvs(command)
    return {
      task: commandInfo.string,
      envs: commandInfo.envs,
      name: name,
      logs: [],
      isRun: false,
      index: index,
      isNPM: !!isNpmCommand,
    }
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
      _.merge(
        allCommands,
        parseCommands(
          _.reduce(
            data.toString().split(/\n/),
            function(processes, line) {
              if (line && line[0] !== '#') {
                var tuple = /^([A-Za-z0-9_-]+):\s*(.+)$/m.exec(line)
                var prockey = tuple[1].trim()
                var command = tuple[2].trim()
                if (!prockey || !command) {
                  throw new Error(
                    'Syntax Error in Procfile, Line %d: No ' +
                      (!prockey ? 'Procfile' : 'Command') +
                      ' Found'
                  )
                }
                if (!tasks || _.includes(tasks, prockey)) {
                  processes[prockey] = command
                }
              }
              return processes
            },
            {}
          )
        )
      )
    } catch (e) {
      console.warn(
        'Procfile not found (or have some problems with parsing Procfile)'
      )
    }
  }
  return storage.set('commands', allCommands)
}

module.exports.load = load
