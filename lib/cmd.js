const platform = require('os').platform()

function getCommandLine(commonArg) {
  var file, args
  if (platform === 'win32') {
    file = process.env.comspec || 'cmd.exe'
    args = ['/s', '/c']
  } else {
    file = '/bin/sh'
    args = ['-c']
  }

  if (commonArg) {
    args.push(commonArg)
  }
  return { file: file, args: args }
}

module.exports.getCommandLine = getCommandLine
