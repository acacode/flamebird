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

process.once('SIGINT', function() {
  console.warn('Interrupted by User')
  emitter.emit('killall', 'SIGINT')
})

// Kill All Child Processes & Exit on SIGTERM
process.once('SIGTERM', function() {
  console.warn('killall', 'SIGTERM')
  process.exit()
})

program.version(utils.getLogoWithVersion(), '-v, --version')
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
    '-t, --tasks [tasks]',
    'List of tasks which will be run flamebird ( example : --tasks start,start:dev,start-server )'
  )
  .description('Start the jobs in the Procfile/Package.json')
  .action(function(args) {
    storage.set('actionArgs', args)
    require('./lib/envs').load(program.env)
    const taskfile = require('./lib/taskfile').load(program.procfile, args)
    processWorker.runAll(taskfile, args)
  })
program
  .command('web')
  .usage('[Options]')
  .option('-p, --port <PORT>', 'sets the server port', 5050)
  .option(
    '-n, --name <NAME>',
    'sets the project name',
    "By default takes from 'package.json' else 'flamebird'"
  )
  .option(
    '-t, --tasks [tasks]',
    'List of tasks which will be run flamebird ( example : --tasks start,start:dev,start-server )'
  )
  .description('Start the jobs in the Procfile/Package.json')
  .action(function(args) {
    args.web = true
    setTimeout(() => {
      storage.set('actionArgs', args)
      require('./lib/envs').load(program.env)
      const taskfile = require('./lib/taskfile').load(program.procfile, args)
      server.start(taskfile, args.port, args)
    }, 8000)
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  console.log(utils.getLogoWithVersion())
  program.outputHelp()
  console.log(process.env.npm_config_)
}
