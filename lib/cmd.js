const isWin = require('os').platform() === 'win32'
const _ = require('lodash')

function getCommandLine(commonArgs, commonOptions, isWeb) {
  var file, args
  var options = {
    stdio: isWeb ? 'pipe' : 'inherit',
    windowsVerbatimArguments: isWin,
  }
  if (isWin) {
    file = process.env.comspec || 'cmd.exe'
    args = ['/s', '/c']
  } else {
    file = '/bin/sh'
    args = ['-c']
  }

  if (commonArgs) {
    commonArgs.forEach(function(arg) {
      args.push(arg)
    })
  }
  if (commonOptions) {
    options = _.assign({}, options, commonOptions)
  }
  // if (options.stdio == null) {
  //   stdio = ['pipe']
  //   stdio.push(options.noOut ? 'pipe' : 'inherit')
  //   stdio.push(options.noErr ? 'pipe' : 'inherit')
  //   options.stdio = stdio
  // }
  // options.windowsVerbatimArguments = isWin
  return [file, args, options]
}

module.exports.getCommandLine = getCommandLine
