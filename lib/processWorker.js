const emitter = require('./emitter')
const _ = require('lodash')
const prog = require('child_process')
const ws = require('./ws')
let colors = require('colors')
colors.enabled = true
const kill = require('tree-kill')
const storage = require('./storage')
const getCommandLine = require('./cmd').getCommandLine

let processes = {}
let killAllListenerRefs = {}

function updateTask(taskId, { isRun, isLaunching, isStopping, log }) {
  let command = getCommandById(taskId)
  let message = {
    name: command.name,
    isRun: command.isRun,
    isNPM: command.isNPM,
    id: taskId,
  }
  if (!_.isUndefined(isLaunching)) {
    message.isLaunching = isLaunching
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

function pushLog(taskId, rawLog, isEnded) {
  let log = rawLog.toString()
  updateTask(taskId, { isRun: !isEnded, log })
}

const getCommandById = taskId =>
  _.find(storage.get('commands', []), command => command.id === taskId)

const removeProcess = taskId => {
  processes[taskId].pid = null
  processes[taskId] = null
  delete processes[taskId]
  if (emitter._events.killall && emitter._events.killall instanceof Array) {
    emitter._events.killall.splice(killAllListenerRefs[taskId], 1)
  }
  delete killAllListenerRefs[taskId]
}

function killProcess(taskId) {
  if (processes[taskId]) {
    kill(processes[taskId].pid, 'SIGINT')
    removeProcess(taskId)
  }
}

function stop(command) {
  if (_.isString(command)) {
    command = getCommandById(command)
  }
  updateTask(command.id, { isStopping: true })
  killProcess(command.id)
}

function run(command) {
  if (_.isString(command)) {
    command = getCommandById(command)
  }

  const taskId = command.id
  const isWeb = storage.get('actionArgs').web
  const cmdOptions = getCommandLine(
    command.rawTask,
    _.assign({}, process.env, storage.get('envFile'), command.envs),
    isWeb
  )

  if (isWeb) {
    let child = (processes[taskId] = prog.spawn.apply(prog, cmdOptions))
    child.stdout.on('data', rawData => pushLog(taskId, rawData))
    child.stderr.on('data', rawData => pushLog(taskId, rawData))
    child.on('close', code => {
      killProcess(taskId)
      pushLog(
        taskId,
        !code ? 'Exited Successfully' : 'Exited with exit code ' + code,
        true
      )
    })
    setTimeout(() => updateTask(taskId, { isRun: true }), 600)
    emitter.once('killall', () => killProcess(taskId))
    killAllListenerRefs[taskId] = emitter.listeners('killall').length - 1
  } else {
    let proc = prog.spawn.apply(prog, cmdOptions)
    proc.stdout.on('data', log => process.stdout.write(log.toString()))
    proc.stderr.on('data', log => process.stdout.write(log.toString()))
  }
}

function reRun(taskId) {
  const isLaunching = true
  if (processes[taskId]) {
    kill(processes[taskId].pid, 'SIGINT', () => {
      updateTask(taskId, { isLaunching })
      setTimeout(() => run(taskId), 1000)
    })
    updateTask(taskId, { isLaunching })
  } else {
    updateTask(taskId, { isLaunching })
    run(taskId)
  }
}

function runAll(commands) {
  _.each(commands, run)
}
function stopAll(commands) {
  _.each(commands, stop)
}

module.exports.runAll = runAll
module.exports.stopAll = stopAll
module.exports.run = run
module.exports.stop = stop
module.exports.reRun = reRun
module.exports.getCommandById = getCommandById
module.exports.getProcesses = function() {
  return processes
}
