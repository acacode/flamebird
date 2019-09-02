const _ = require('lodash')
const {
  killProcess,
  attachKillListener,
  getProcessById,
  createProcess,
} = require('./utils/processes')
const { updateCommand } = require('./utils/commands')

const colors = require('colors')
const kill = require('tree-kill')
const { getConfig } = require('./config')

colors.enabled = true

function stop(command) {
  // if (_.isString(command)) {
  //   command = getCommandById(command)
  // }

  killProcess(command.id)
  updateCommand(command, { isStopping: true })
}

function run(command) {
  // if (_.isString(command)) {
  //   command = getCommandById(command)
  // }

  const taskId = command.id
  const isWeb = getConfig().web
  const proc = createProcess(command)

  if (isWeb) {
    updateCommand(command, { isRun: true })

    proc.stdout.on('data', rawLog =>
      updateCommand(command, {
        log: rawLog.toString(),
        isRun: true,
      })
    )
    proc.stderr.on('data', rawLog =>
      updateCommand(command, {
        log: rawLog.toString(),
        isRun: true,
      })
    )
    proc.on('close', code => {
      killProcess(taskId)
      updateCommand(command, {
        isRun: false,
        log: !code ? 'Exited Successfully' : 'Exited with exit code ' + code,
      })
    })
    proc.on('error', () => {
      killProcess(taskId)
      updateCommand(command, {
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

function reRun(command) {
  const isLaunching = true
  const proc = getProcessById(command.id)

  if (proc) {
    kill(proc.pid, 'SIGINT', () => {
      updateCommand(command, { isLaunching })
      setTimeout(() => run(command), 1000)
    })
    updateCommand(command, { isLaunching })
  } else {
    updateCommand(command, { isLaunching })
    run(command)
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
