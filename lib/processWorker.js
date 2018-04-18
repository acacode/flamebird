const emitter = require('./emitter')
const _ = require('lodash')
var prog = require('child_process')
const getCommandLine = require('./cmd').getCommandLine

function processRun(name, configuration) {
  const cmd = getCommandLine(configuration.command)

  var child = prog.spawn(cmd.file, cmd.args, { env: configuration.env })

  child.stdout.on('data', function(data) {
    console.log(name, data.toString())
  })

  child.stderr.on('data', function(data) {
    console.log(name, data.toString())
  })

  child.on('close', function(code) {
    if (code === 0) {
      console.info(name, 'Exited Successfully')
    } else {
      console.error(name, 'Exited with exit code ' + code)
    }
  })

  emitter.on('killall', function(signal) {
    child.kill(signal)
  })
}

function processStart(procfile, _port) {
  // TODO
  var port = parseInt(_port)

  if (port < 1024) {
    return console.error(
      'Only Proxies Can Bind to Privileged Ports - ' +
        "Try 'sudo nf start -x %s'",
      port
    )
  }
  _.each(procfile, function(command) {
    processRun(
      command.name,
      {
        command: command.task,
        env: _.assign({}, process.env, command.envs),
      },
      emitter
    )
  })
}

module.exports = function(proc) {
  // Kill All Child Processes on SIGINT
  proc.once('SIGINT', function() {
    console.warn('Interrupted by User')
    emitter.emit('killall', 'SIGINT')
  })

  // Kill All Child Processes & Exit on SIGTERM
  proc.once('SIGTERM', function() {
    console.warn('killall', 'SIGTERM')
    process.exit()
  })

  return {
    start: processStart,
    run: processRun,
  }
}
