const _ = require('lodash')
const prog = require('child_process')
const emitter = require('./emitter')
const storage = require('./storage')
const kill = require('tree-kill')
const isWin = require('os').platform() === 'win32'

const processes = {}
const killAllListenerRefs = {}

const deleteProcess = taskId => {
  processes[taskId].pid = null
  processes[taskId] = null
  delete processes[taskId]
  const emitterListeners = emitter._events.killall
  if (emitterListeners && emitterListeners instanceof Array) {
    emitterListeners.splice(killAllListenerRefs[taskId], 1)
  }
  delete killAllListenerRefs[taskId]
}

function killProcess(taskId) {
  if (processes[taskId]) {
    kill(processes[taskId].pid, 'SIGINT')
    deleteProcess(taskId)
  }
}

function attachKillListener(taskId) {
  emitter.once('killall', () => killProcess(taskId))
  killAllListenerRefs[taskId] = emitter.listeners('killall').length - 1
}

function getProcessById(taskId) {
  return processes[taskId]
}

function createProcess(command) {
  const processConfig = isWin
    ? {
        file: process.env.comspec || 'cmd.exe',
        args: ['/s', '/c', command.rawTask],
      }
    : {
        file: '/bin/sh',
        args: ['-c', command.rawTask],
      }
  return (processes[command.id] = prog.spawn(
    processConfig.file,
    processConfig.args,
    {
      stdio: 'pipe',
      windowsVerbatimArguments: isWin,
      env: _.assign({}, process.env, storage.get('envFile'), command.envs),
    }
  ))
}

module.exports = {
  killProcess,
  attachKillListener,
  getProcessById,
  createProcess,
}
