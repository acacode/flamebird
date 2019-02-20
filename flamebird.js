#!/usr/bin/env node
// Copyright IBM Corp. 2012,2015. All Rights Reserved.
// Node module: flamebird
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const _ = require('lodash')
const program = require('commander')
const storage = require('./lib/utils/storage')
const emitter = require('./lib/utils/emitter')
const processWorker = require('./lib/processWorker')
const server = require('./lib/server')

/* special properties for colorizing output logs */
process.env.FORCE_COLOR = true
process.env.colors = true
process.env.color = true

function init(args, isWeb) {
  args.web = !!isWeb
  storage.set('options', {
    ignorePms: !!args.ignorePms,
    name: args.name,
    port: +args.port,
    tasks: _.compact(_.split(args.tasks, /[,]|[, ]/g)),
    useAnotherPm: args.useAnotherPm,
    useOnlyPackageJson: !!args.package,
    web: args.web,
    withoutBrowser: !!args.withoutBrowser,
    sortByName: !!args.sortByName,
  })
  require('./lib/utils/envs').load(program.env)
  return require('./lib/taskfile').load(program.procfile)
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

program.version(getLogo(true), '-v, --version')
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
    '-i, --ignore-pms',
    '[Ignore package managers] - Allows to launch tasks without yarn or npm ( use original paths: webpack -> node_modules/.bin/webpack )',
    false
  )
  .option(
    '-t, --tasks [tasks]',
    'List of tasks which will be run flamebird ( example : --tasks start,start:dev,start-server )'
  )
  .option(
    '-u, --use-another-pm <NAME>',
    'Allows to use another package manager for launch tasks. By default will use npm ( For example: -y yarn )',
    'npm'
  )
  .description('Start the jobs in the Procfile/Package.json')
  .action(args => processWorker.runAll(init(args)))

program
  .command('web')
  .usage('[Options]')
  .option('-p, --port <PORT>', 'sets the server port', 5050)
  .option(
    '-i, --ignore-pms',
    'Allows to launch tasks without yarn or npm ( use absolute paths: webpack -> node_modules/.bin/webpack )',
    false
  )
  .option(
    '-n, --name <NAME>',
    'Sets the project name. By default takes from "package.json" else "flamebird"',
    'flamebird'
  )
  .option(
    '-t, --tasks [tasks]',
    'List of tasks which will be run flamebird ( example : --tasks start,start:dev,start-server )'
  )
  .option(
    '-u, --use-another-pm <NAME>',
    'Allows to use another package manager for launch tasks. By default will use npm ( For example: -y yarn )',
    'npm'
  )
  .option(
    '-w, --without-browser',
    'This option disable opening the new tab in Google Chrome browser',
    false
  )
  .option(
    '-s, --sort-by-name',
    'This option using to sort all commands by name (asc)',
    false
  )
  .description(
    'Launch web application which will help to manage all tasks in your application'
  )
  .action(args => server.start(init(args, true)))

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  console.log(getLogo())
  program.outputHelp()
}

function getLogo(displayOnlyVersion) {
  const packageJson = require('./package.json')
  const strings = []
  if (!displayOnlyVersion) {
    strings.push('\x1b[33m  ╔══╗ ╔╗   ╔══╗ ╔╗  ╔╗ ╔═══╗ ╔══╗  ╔══╗ ╔═══╗ ╔══╗ \x1b[0m')
    strings.push('\x1b[31m  ║╔═╝\x1b[33m ║║   ║╔╗║ ║║  ║║ ║╔══╝ ║╔╗║  ╚╗╔╝ ║╔═╗║ \x1b[31m║╔╗╚╗ \x1b[0m')
    strings.push('\x1b[31m  ║╚═╗ \x1b[33m║║   ║╚╝║ ║╚╗╔╝║ ║╚══╗ ║╚╝╚╗  ║║  ║╚═╝║\x1b[31m ║║╚╗║ \x1b[0m')
    strings.push('\x1b[31m  ║╔═╝ ║║   ║╔╗║\x1b[33m ║╔╗╔╗║ ║╔══╝ ║╔═╗║  \x1b[31m║║  ║╔╗╔╝ ║║ ║║ \x1b[0m')
    strings.push('\x1b[31m  ║║   ║╚═╗ ║║║║ \x1b[33m║║╚╝║║ ║╚══╗ ║╚═╝║\x1b[31m ╔╝╚╗ ║║║║  ║╚═╝║ \x1b[0m')
    strings.push('\x1b[31m  ╚╝   ╚══╝ ╚╝╚╝ ╚╝  ╚╝ \x1b[33m╚═══╝\x1b[31m ╚═══╝ ╚══╝ ╚╝╚╝  ╚═══╝ \x1b[0m')
    strings.push('            \x1b[90m - wonderful nodejs task manager \x1b[39m        ')
  }
  const v =
    packageJson.version + new Array(10 - packageJson.version.length).join(' ')
  const commonSpace = displayOnlyVersion ? '  ' : '                           '
  strings.push(commonSpace + '\x1b[31m╔═══════════════╗  \x1b[0m')
  strings.push(commonSpace + '\x1b[31m║\x1b[0m    \x1b[33mv' + v + '\x1b[0m \x1b[31m║  \x1b[0m')
  strings.push(commonSpace + '\x1b[31m╚═══════════════╝  \x1b[0m\r\n')
  return strings.join('\r\n')
}