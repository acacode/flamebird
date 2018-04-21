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
program.option('-P, --port <PORT>', 'start indexing ports at number PORT', 0)
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
    const taskfile = require('./lib/taskfile').load(program.procfile, args)
    processWorker.runAll(taskfile, args)
  })
program
  .command('web')
  .usage('[Options]')
  .option('-p, --package', 'Use package.json for managing tasks')
  .option(
    '-t, --tasks [tasks]',
    'List of tasks which will be run flamebird ( example : --tasks start,start:dev,start-server )'
  )
  .description('Start the jobs in the Procfile/Package.json')
  .action(function(args) {
    args.web = true
    storage.set('actionArgs', args)
    const taskfile = require('./lib/taskfile').load(program.procfile, args)
    server.start(taskfile, program.port || process.env.PORT || 5050, args)
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  console.log(utils.getLogoWithVersion())
  program.outputHelp()
}
