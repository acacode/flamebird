const isWin = require('os').platform() === 'win32'

function getCommandLine(task, env, isWeb) {
  var file, args
  var options = {
    stdio: isWeb ? 'pipe' : 'inherit',
    windowsVerbatimArguments: isWin,
    env: env,
  }
  if (isWin) {
    file = process.env.comspec || 'cmd.exe'
    args = ['/s', '/c']
  } else {
    file = '/bin/sh'
    args = ['-c']
  }

  args.push(task)
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
