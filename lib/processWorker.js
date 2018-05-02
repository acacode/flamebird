const emitter = require('./emitter')
const _ = require('lodash')
const prog = require('child_process')
const ws = require('./ws')
const kill = require('tree-kill')
// const moment = require('moment')
const storage = require('./storage')
const getCommandLine = require('./cmd').getCommandLine

var processes = {}

function saveCommandData(stdout, isRun) {
  // var data = '[' + moment().format('HH:mm:ss') + '] ' + stdout.toString()
  var data = stdout.toString()
  var name = this.name
  if (storage.get('actionArgs').web) {
    var command = getCommandByName(name)
    command.logs.push(data)
    command.isRun = isRun === undefined
    // this.logs.push(data)
    ws.send({
      name: name,
      log: data,
      isRun: command.isRun,
      isNPM: command.isNPM,
    })
  } else {
    console.log(data)
  }
}

function getCommandByName(name) {
  return _.find(storage.get('commands', []), function(command) {
    return command.name === name
  })
}

function killProcess(name) {
  if (processes[name]) {
    kill(processes[name].pid, 'SIGINT')
    // process.kill(processes[command.name].pid, 'SIGINT')
    processes[name] = null
    delete processes[name]
  }
}

function stop(command) {
  if (typeof command === 'string') {
    command = getCommandByName(command)
  }
  command.isRun = false
  killProcess(command.name)
}

function run(command) {
  if (typeof command === 'string') {
    command = getCommandByName(command)
  }
  command.isRun = true
  const name = command.name
  const configuration = {
    command: command.isNPM ? 'npm run ' + name : command.task,
    env: _.assign({}, process.env, command.envs),
  }
  const cmd = getCommandLine(configuration.command)
  var child = (processes[name] = prog.spawn(cmd.file, cmd.args, {
    env: configuration.env,
  }))

  child.stdout.on('data', saveCommandData.bind(command))
  child.stderr.on('data', saveCommandData.bind(command))

  child.on('close', function(code) {
    saveCommandData.call(
      command,
      code === 0 ? 'Exited Successfully' : 'Exited with exit code ' + code,
      false
    )
  })

  emitter.on('killall', function(signal) {
    killProcess(name)
  })
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
