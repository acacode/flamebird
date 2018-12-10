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

function initCommandLine() {
  var _ = require('lodash')

  function terminalLine(lineCharacter = '-', reduceWidth = 0) {
    return _.times(
      process.stdout.columns - reduceWidth,
      () => lineCharacter
    ).join('')
  }
  const drawTable = () => {
    process.stdout.write('\033[2J');
    process.stdout.write('\033[0;0f');
    process.stdout.write('\033c');
    console.log('  ' + terminalLine('=', 5) + '   ')
    for(let x=0; x< process.stdout.rows-4; x++){
      console.log('    ' + terminalLine(' ', 8) + '    ')
    }
    console.log('  ' + terminalLine('=', 5) + '   ')
  }
  drawTable()
  setInterval(()=>{
    drawTable()
  }, 200)
}

module.exports = {
  getCommandLine: getCommandLine,
  initCommandLine: initCommandLine,
}
