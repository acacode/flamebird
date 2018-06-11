const isWin = require('os').platform() === 'win32'

function getCommandLine(task, env, isWeb) {
  var file, args
  var options = {
    stdio: isWeb ? 'pipe' : 'pipe',
    windowsVerbatimArguments: isWin,
    env,
  }
  if (isWin) {
    file = process.env.comspec || 'cmd.exe'
    args = ['/s', '/c', task]
  } else {
    file = '/bin/sh'
    args = ['-c', task]
  }

  // if (options.stdio == null) {
  //   stdio = ['pipe']
  //   stdio.push(options.noOut ? 'pipe' : 'inherit')
  //   stdio.push(options.noErr ? 'pipe' : 'inherit')
  //   options.stdio = stdio
  // }
  // options.windowsVerbatimArguments = isWin
  env = null
  return [file, args, options]
}

module.exports.getCommandLine = getCommandLine
