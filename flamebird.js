#!/usr/bin/env node
// Copyright IBM Corp. 2012,2015. All Rights Reserved.
// Node module: flamebird
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var program = require('commander')
var packageJson = require('./package.json')
const processWorker = require('./lib/processWorker')(process)

program.version(getLogoWithVersion(true), '-v, --version')
program.option('-j, --procfile <FILE>', 'load procfile from file', 'Procfile')
program.option(
  '-e, --env <FILE>',
  'load environment from file, a comma-separated list',
  '.env'
)
program.option('-p, --port <PORT>', 'start indexing ports at number PORT', 0)
program
  .command('start')
  .usage('[Options]')
  .description('Start the jobs in the Procfile')
  .action(function(args) {                                                             
    const procfile = require('./lib/procfile').load(program.procfile)
    processWorker.start(procfile, program.port || process.env.PORT || 5050)
  })

program.parse(process.argv)

function getLogoWithVersion(onlyVersion){
  var strings = []
  if(!onlyVersion){
     strings.push('  ╔══╗ ╔╗   ╔══╗ ╔╗  ╔╗ ╔═══╗ ╔══╗  ╔══╗ ╔═══╗ ╔══╗ ')
     strings.push('  ║╔═╝ ║║   ║╔╗║ ║║  ║║ ║╔══╝ ║╔╗║  ╚╗╔╝ ║╔═╗║ ║╔╗╚╗')
     strings.push('  ║╚═╗ ║║   ║╚╝║ ║╚╗╔╝║ ║╚══╗ ║╚╝╚╗  ║║  ║╚═╝║ ║║╚╗║')
     strings.push('  ║╔═╝ ║║   ║╔╗║ ║╔╗╔╗║ ║╔══╝ ║╔═╗║  ║║  ║╔╗╔╝ ║║ ║║')
     strings.push('  ║║   ║╚═╗ ║║║║ ║║╚╝║║ ║╚══╗ ║╚═╝║ ╔╝╚╗ ║║║║  ║╚═╝║')
     strings.push('  ╚╝   ╚══╝ ╚╝╚╝ ╚╝  ╚╝ ╚═══╝ ╚═══╝ ╚══╝ ╚╝╚╝  ╚═══╝')
     strings.push('             - wonderful nodejs task manager        ')
  }
  const v = packageJson.version + (new Array(11 - packageJson.version.length).join(' '))
  const commonSpace = onlyVersion ? '  ' : '                           '
   strings.push(commonSpace+'╔═══════════════╗  ')
   strings.push(commonSpace+'║    v' + v + '║  ')
   strings.push(commonSpace+'╚═══════════════╝  ')
   return strings.join('\r\n')
}
if (!process.argv.slice(2).length) {
  console.log(getLogoWithVersion())
  process.argv.push('start')
  program.parse(process.argv)
}
