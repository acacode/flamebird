const emitter = require('./emitter')
const _ = require('lodash')
const prog = require('child_process')
const ws = require('./ws')
const getCommandLine = require('./cmd').getCommandLine

var commands = null
var processes = {}
var actionArgs = null

function saveCommandData(stdout) {
  var data = stdout.toString()
  var name = this.name
  if (actionArgs.web) {
    _.find(commands, function(c) {
      return c.name === name
    }).logs.push(data)
    // this.logs.push(data)
    ws.send({
      name: name,
      log: data,
    })
  } else {
    console.log(data)
  }
}

function run(command) {
  const name = command.name
  const configuration = {
    command: command.task,
    env: _.assign({}, process.env, command.envs),
  }
  const cmd = getCommandLine(configuration.command)
  var child = (processes[name] = prog.spawn(cmd.file, cmd.args, {
    env: configuration.env,
  }))

  child.stdout.on('data', saveCommandData.bind(command))

  // child.stderr.on('data', function(data) {
  //   console.log('stderr', name, data.toString())
  // })

  child.on('close', function(code) {
    if (code === 0) {
      console.info(name, 'Exited Successfully')
    } else {
      console.error(name, 'Exited with exit code ' + code)
    }
  })

  processes[name].terminate = function(signal) {
    processes[name].kill(signal)
    processes[name] = null
    delete processes[name]
  }

  emitter.on('killall', function(signal) {
    processes[name].terminate(signal)
  })
}
function reRun(name) {
  var process = processes[name]
  if (process) {
    process.terminate('SIGNINT')
    run(commands[name])
  }
}

function start(taskfile, args) {
  commands = taskfile
  actionArgs = args
  _.each(taskfile, run)
}

function web(taskfile, port, args) {
  commands = taskfile
  actionArgs = args
  const api = require('./server').createServer(parseInt(port))
  api.get('/commands', function(req, res) {
    res.send(commands)
  })
  api.post('/run', function(req, res) {
    console.log(req.body)
    run(req.body)
    res.send('ok')
  })
  // respond with "hello world" when a GET request is made to the homepage
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
    start: start,
    run: run,
    web: web,
    reRun: reRun,
    processes: processes,
  }
}
