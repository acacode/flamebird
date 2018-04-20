#!/usr/bin/env node
// Copyright IBM Corp. 2012,2015. All Rights Reserved.
// Node module: flamebird
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const program = require('commander')
const utils = require('./lib/utils')
const processWorker = require('./lib/processWorker')(process)

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
  .option(
    '-w, --web',
    'Launch webview for managing jobs. If this flag is setted then tasks will not be running in the command line'
  )
  .option('-p, --package', 'Use package.json for managing tasks')
  .option(
    '-t, --tasks [tasks]',
    'List of tasks which will be run flamebird ( example : --tasks start,start:dev,start-server )'
  )
  .description('Start the jobs in the Procfile/Package.json')
  .action(function(args) {
    const taskfile = require('./lib/taskfile').load(program.procfile, args)
    if (args.web) {
      processWorker.web(
        taskfile,
        program.port || process.env.PORT || 5050,
        args
      )
    } else {
      processWorker.start(taskfile, args)
    }
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  console.log(utils.getLogoWithVersion())
  program.outputHelp()
}
