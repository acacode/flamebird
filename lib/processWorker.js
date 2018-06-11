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

let processes = {}
let killAllListenerRefs = {}

function updateTask(name, { isRun, isStartRunning, isStopping, log }) {
  let command = getCommandByName(name)
  let message = {
    name: command.name,
    isRun: command.isRun,
    isNPM: command.isNPM,
  }
  if (!_.isUndefined(isStartRunning)) {
    message.isStartRunning = isStartRunning
  }
  if (!_.isUndefined(isStopping)) {
    message.isStopping = isStopping
  }
  if (!_.isUndefined(isRun)) {
    message.isRun = command.isRun = isRun
  }
  if (!_.isUndefined(log)) {
    command.logs.push(log)
    message.log = log
  }
  ws.send(message)
}

function pushLog(name, rawLog, isEnded) {
  var log = rawLog.toString()
  updateTask(name, { isRun: !isEnded, log })
}

const getCommandByName = name =>
  _.find(storage.get('commands', []), command => command.name === name)

const removeProcess = name => {
  processes[name].pid = null
  processes[name] = null
  delete processes[name]
  if (emitter._events.killall && emitter._events.killall instanceof Array) {
    emitter._events.killall.splice(killAllListenerRefs[name], 1)
  }
  delete killAllListenerRefs[name]
}

function killProcess(name) {
  if (processes[name]) {
    kill(processes[name].pid, 'SIGINT')
    removeProcess(name)
  }
}

function stop(command) {
  if (_.isString(command)) {
    command = getCommandByName(command)
  }
  updateTask(command.name, { isStopping: true })
  killProcess(command.name)
}

function run(command) {
  if (_.isString(command)) {
    command = getCommandByName(command)
  }

  const name = command.name
  const isWeb = storage.get('actionArgs').web
  const cmdOptions = getCommandLine(
    command.rawTask,
    _.assign({}, process.env, storage.get('envFile'), command.envs),
    isWeb
  )

  if (isWeb) {
    let child = (processes[name] = prog.spawn.apply(prog, cmdOptions))
    child.stdout.on('data', rawData => pushLog(name, rawData))
    child.stderr.on('data', rawData => pushLog(name, rawData))
    child.on('close', code => {
      killProcess(name)
      pushLog(
        name,
        !code ? 'Exited Successfully' : 'Exited with exit code ' + code,
        true
      )
    })
    setTimeout(() => updateTask(name, { isRun: true }), 600)
    emitter.once('killall', () => killProcess(name))
    killAllListenerRefs[name] = emitter.listeners('killall').length - 1
  } else {
    let proc = prog.spawn.apply(prog, cmdOptions)
    proc.stdout.on('data', log => process.stdout.write(log.toString()))
    proc.stderr.on('data', log => process.stdout.write(log.toString()))
  }
  // console.log('killall length', emitter._events.killall.length)
}

function reRun(name) {
  const isStartRunning = true
  if (processes[name]) {
    kill(processes[name].pid, 'SIGINT', () => {
      updateTask(name, { isStartRunning })
      setTimeout(() => run(name), 1000)
    })
    updateTask(name, { isStartRunning })
  } else {
    updateTask(name, { isStartRunning })
    run(name)
  }
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
