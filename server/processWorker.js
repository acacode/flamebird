const _ = require('lodash')
const {
  killProcess,
  attachKillListener,
  getProcessById,
  createProcess,
} = require('./utils/processes')
const { getCommandById, updateCommand } = require('./utils/commands')

const colors = require('colors')
const kill = require('tree-kill')
const storage = require('./utils/storage')

colors.enabled = true

function stop(command) {
  if (_.isString(command)) {
    command = getCommandById(command)
  }

  killProcess(command.id)
  updateCommand(command.id, { isStopping: true })
}

function run(command) {
  if (_.isString(command)) {
    command = getCommandById(command)
  }

  const taskId = command.id
  const isWeb = storage.get('options').web
  const proc = createProcess(command)

  if (isWeb) {
    updateCommand(taskId, { isRun: true })

    proc.stdout.on('data', rawLog =>
      updateCommand(taskId, {
        log: rawLog.toString(),
        isRun: true,
      })
    )
    proc.stderr.on('data', rawLog =>
      updateCommand(taskId, {
        log: rawLog.toString(),
        isRun: true,
      })
    )
    proc.on('close', code => {
      killProcess(taskId)
      updateCommand(taskId, {
        isRun: false,
        log: !code ? 'Exited Successfully' : 'Exited with exit code ' + code,
      })
    })
    proc.on('error', () => {
      killProcess(taskId)
      updateCommand(taskId, {
        isRun: false,
        log: 'Failed to execute command',
      })
    })

    attachKillListener(taskId)
  } else {
    const defaultOutputHandler = log => {
      process.stdout.write(log.toString())
    }
    proc.stdout.on('data', defaultOutputHandler)
    proc.stdout.on('error', defaultOutputHandler)
    proc.stderr.on('data', defaultOutputHandler)
  }
}

function reRun(taskId) {
  const isLaunching = true
  const proc = getProcessById(taskId)

  if (proc) {
    kill(proc.pid, 'SIGINT', () => {
      updateCommand(taskId, { isLaunching })
      setTimeout(() => run(taskId), 1000)
    })
    updateCommand(taskId, { isLaunching })
  } else {
    updateCommand(taskId, { isLaunching })
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
