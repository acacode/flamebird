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

const getCurrentTime = () => {
  const date = new Date()
  const fixDecimal = decimal => (decimal < 10 ? '0' + decimal : decimal)
  return (
    fixDecimal(date.getHours()) +
    ':' +
    fixDecimal(date.getMinutes()) +
    ':' +
    fixDecimal(date.getSeconds())
  )
}
// TODO: Saved for future.
// const prettifyLog = (log, { withTime, name } = {}) => {
//   let time = withTime ? getCurrentTime() : ''
//   const commonLog = _.compact([name, time]).join(' | ')
//   return commonLog ? '| ' + commonLog + ' | ' + log.toString() : log.toString()
// }

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

let latestTask = null
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
    updateTask(taskId, { isRun: true })
    child.stdout.on('data', rawLog =>
      updateTask(taskId, {
        log: rawLog.toString(),
        isRun: true,
      })
    )
    child.stderr.on('data', rawLog =>
      updateTask(taskId, {
        log: rawLog.toString(),
        isRun: true,
      })
    )
    child.on('close', code => {
      killProcess(taskId)
      updateTask(taskId, {
        isRun: false,
        log: !code ? 'Exited Successfully' : 'Exited with exit code ' + code,
      })
    })
    child.on('error', () => {
      killProcess(taskId)
      updateTask(taskId, {
        isRun: false,
        log: 'Failed to execute command',
      })
    })
    emitter.once('killall', () => killProcess(taskId))
    killAllListenerRefs[taskId] = emitter.listeners('killall').length - 1
  } else {
    // const setLogData = newTaskId => {
    // if (latestTask !== null) {
    //   process.stdout.write('-'.repeat(process.stdout.columns) + '\n')
    // }
    // latestTask = newTaskId
    // process.stdout.write(getCommandById(newTaskId).name + '\n')
    // process.stdout.write('-'.repeat(process.stdout.columns) + '\n')
    // }
    let proc = prog.spawn.apply(prog, cmdOptions)
    const defaultStdout = log => {
      // if (latestTask !== taskId) setLogData(taskId)
      const fixedLog = log.toString()
      let addInfo = ` ${command.name}` //eslint-disable-line
      // let addInfo = command.color + ` ${command.name}` + '\033[0m' //eslint-disable-line
      let a = process.stdout.columns * 0.4
      if (a > 25) {
        a = 25
      }
      if (addInfo.length < 18) {
        addInfo += ' '.repeat(18 - addInfo.length)
      }
      let currentTime = `${getCurrentTime()} `
      // addInfo += '\033[38;5;244m' + `${getCurrentTime()} ` + '\033[0m' //eslint-disable-line
      if ((currentTime + addInfo).length < a) {
        currentTime += ' '.repeat(a - addInfo.length)
      }
      process.stdout.write(fixedLog.replace('\n', '\n' + command.color + addInfo + '\033[0m' + '\033[38;5;244m' + currentTime + '\033[0m'))
    }
    proc.stdout.on('data', defaultStdout)
    proc.stderr.on('data', defaultStdout)
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
