const _ = require('lodash')
const prog = require('child_process')
const emitter = require('./emitter')
const kill = require('tree-kill')
const isWin = require('os').platform() === 'win32'

const processConfig = {
  file: isWin ? process.env.comspec || 'cmd.exe' : '/bin/sh',
  args: isWin ? ['/s', '/c'] : ['-c'],
}
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

/**
 * @param {object} command { id, rawTask, envs }
 * @returns spawned process
 */
function createProcess({ id, rawTask, envs }, config) {
  return (processes[id] = prog.spawn(
    processConfig.file,
    [...processConfig.args, rawTask],
    {
      stdio: 'pipe',
      cwd: config.path.replace(/\\/g, '/'),
      windowsVerbatimArguments: isWin,
      env: _.assign(
        {},
        process.env,
        {
          PWD: config.path.replace(/\\/g, '/'),
        },
        // env variables from .env file
        config.envs,
        // env variables from command
        envs
      ),
    }
  ))
}

module.exports = {
  killProcess,
  attachKillListener,
  getProcessById,
  createProcess,
}
