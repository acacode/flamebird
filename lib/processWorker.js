const emitter = require('./emitter')
const _ = require('lodash')
const prog = require('child_process')
const ws = require('./ws')
var colors = require('colors')
colors.enabled = true
const kill = require('tree-kill')
const storage = require('./storage')
const getCommandLine = require('./cmd').getCommandLine

// let LIB_PATHS = null
// const createLibPaths = () => {
//   const [utilFormat, utilDir] =
//     process.platform === 'win32'
//       ? ['.cmd', 'node_modules\\.bin\\']
//       : ['', 'node_modules/.bin/']
//   LIB_PATHS = _.reduce(
//     fs
//       .readdirSync(resolve('node_modules/.bin'))
//       .filter(file => !file.match(/.*\.cmd$/)),
//     (bin, name) => (bin[name] = `${utilDir}${name}${utilFormat}`) && bin,
//     {}
//   )
// }

var processes = {}

function pushLog(name, rawLog, isEnded) {
  // var data = '[' + moment().format('HH:mm:ss') + '] ' + stdout.toString()
  var log = rawLog.toString()
  var command = getCommandByName(name)
  command.logs.push(log)
  command.isRun = !isEnded
  // this.logs.push(data)
  ws.send({
    name,
    log,
    isRun: command.isRun,
    isNPM: command.isNPM,
  })
}

const getCommandByName = name =>
  _.find(storage.get('commands', []), command => command.name === name)

function killProcess(name) {
  if (processes[name]) {
    kill(processes[name].pid, 'SIGINT')
    processes[name].pid = null
    processes[name] = null
    delete processes[name]
    emitter.removeListener('killall', () => killProcess(name))
  }
}

function stop(command) {
  if (_.isString(command)) {
    command = getCommandByName(command)
  }
  command.isRun = false
  killProcess(command.name)
}

function run(command) {
  if (_.isString(command)) {
    command = getCommandByName(command)
  }
  command.isRun = true
  const name = command.name
  var isWeb = storage.get('actionArgs').web
  let child = (processes[name] = prog.spawn.apply(
    prog,
    getCommandLine(
      [command.rawTask],
      {
        env: _.assign({}, process.env, storage.get('envFile'), command.envs),
      },
      isWeb
    )
  ))
  if (isWeb) {
    child.stdout.on('data', rawData => pushLog(name, rawData))
    child.stderr.on('data', rawData => pushLog(name, rawData))
    child.on('close', code =>
      pushLog(
        name,
        !code ? 'Exited Successfully' : 'Exited with exit code ' + code,
        true
      )
    )

    ws.send({
      name,
      isRun: command.isRun,
    })
  }
  emitter.once('killall', () => killProcess(name))
  // console.log('killall length', emitter._events.killall.length)
  child = null
}

function reRun(name) {
  killProcess(name)
  run(name)
}

function runAll(commands, args) {
  _.each(commands, run)
}
function stopAll(commands, args) {
  _.each(commands, stop)
}

module.exports.runAll = runAll
module.exports.stopAll = stopAll
module.exports.run = run
module.exports.stop = stop
module.exports.reRun = reRun
module.exports.getCommandByName = getCommandByName
module.exports.getProcesses = function() {
  return processes
}
