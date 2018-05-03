const emitter = require('./emitter')
const _ = require('lodash')
const prog = require('child_process')
const ws = require('./ws')
var colors = require('colors')
colors.enabled = true
const kill = require('tree-kill')
const storage = require('./storage')
const getCommandLine = require('./cmd').getCommandLine

var processes = {}

function saveCommandData(commandName, rawData, isEnded) {
  // var data = '[' + moment().format('HH:mm:ss') + '] ' + stdout.toString()
  var data = rawData.toString()
  var command = getCommandByName(commandName)
  command.logs.push(data)
  command.isRun = !isEnded
  // this.logs.push(data)
  ws.send({
    name: commandName,
    log: data,
    isRun: command.isRun,
    isNPM: command.isNPM,
  })
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
    command: command.isNPM ? 'yarn ' + name : command.task,
    env: _.assign({}, process.env, command.envs, { colors: true, color: true }),
  }
  var isWeb = storage.get('actionArgs').web
  const cmd = getCommandLine(
    [configuration.command],
    {
      env: _.assign({}, configuration.env),
    },
    isWeb
  )
  // processes[name] = betterSpawn(configuration.command)
  var child = (processes[name] = prog.spawn.apply(prog, cmd))
  if (isWeb) {
    child.stdout.on('data', function(rawData) {
      saveCommandData(name, rawData)
    })
    child.stderr.on('data', function(rawData) {
      saveCommandData(name, rawData)
    })
    child.on('close', function(code) {
      saveCommandData(
        name,
        code === 0 ? 'Exited Successfully' : 'Exited with exit code ' + code,
        true
      )
    })
  }

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
