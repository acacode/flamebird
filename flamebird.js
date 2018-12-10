#!/usr/bin/env node
// Copyright IBM Corp. 2012,2015. All Rights Reserved.
// Node module: flamebird
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const program = require('commander')
const utils = require('./lib/utils')
const storage = require('./lib/storage')
const emitter = require('./lib/emitter')
const processWorker = require('./lib/processWorker')
const server = require('./lib/server')
process.env.FORCE_COLOR = true
process.env.colors = true
process.env.color = true

function init(args, isWeb) {
  args.web = !!isWeb
  storage.set('actionArgs', args)
  require('./lib/envs').load(program.env)
  return require('./lib/taskfile').load(program.procfile, args)
}

process.once('SIGINT', function() {
  emitter.emit('killall', 'SIGINT')
  process.exit()
})
// Kill All Child Processes & Exit on SIGTERM
process.once('SIGTERM', function() {
  emitter.emit('killall', 'SIGTERM')
  process.exit()
})

program.version(utils.getLogoWithVersion(), '-v, --version')
program.usage('[command] [options]')
program.option('-j, --procfile <FILE>', 'load procfile from file', 'Procfile')
program.option(
  '-e, --env <FILE>',
  'load environment from file, a comma-separated list',
  '.env'
)
program
  .command('start')
  .usage('[Options]')
  .option('-p, --package', 'Use package.json for managing tasks')
  .option(
    '-t, --tasks <TASKS>',
    'List of tasks which will be run in flamebird ( example: "fb start -t start,start:dev,start-server" )'
  )
  .description('Start the jobs in the Procfile/Package.json')
  .action(args => processWorker.runAll(init(args), args))
program
  .command('web')
  .usage('[Options]')
  .option('-p, --port <PORT>', 'Sets the server port', 5050)
  .option(
    '-n, --name <NAME>',
    'Sets the project name. By default name will takes from "package.json" else "flamebird"'
  )
  .option(
    '-t, --tasks <TASKS>',
    'List of tasks which will be run in flamebird ( example: "fb start -t start,start:dev,start-server" )'
  )
  .description(
    'Launch web GUI for managing your tasks from package.json or Procfile. Starting and stopping tasks via one click, more convenient than "fb start"'
  )
  .action(args => server.start(init(args, true), args.port, args))

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  console.log(utils.getLogoWithVersion())
  program.outputHelp()
  console.log(process.env.npm_config_)
}
