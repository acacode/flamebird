const packageJson = require('../package.json')

function getLogoWithVersion(onlyVersion) {
  var strings = []
  if (!onlyVersion) {
    strings.push('  ╔══╗ ╔╗   ╔══╗ ╔╗  ╔╗ ╔═══╗ ╔══╗  ╔══╗ ╔═══╗ ╔══╗ ')
    strings.push('  ║╔═╝ ║║   ║╔╗║ ║║  ║║ ║╔══╝ ║╔╗║  ╚╗╔╝ ║╔═╗║ ║╔╗╚╗')
    strings.push('  ║╚═╗ ║║   ║╚╝║ ║╚╗╔╝║ ║╚══╗ ║╚╝╚╗  ║║  ║╚═╝║ ║║╚╗║')
    strings.push('  ║╔═╝ ║║   ║╔╗║ ║╔╗╔╗║ ║╔══╝ ║╔═╗║  ║║  ║╔╗╔╝ ║║ ║║')
    strings.push('  ║║   ║╚═╗ ║║║║ ║║╚╝║║ ║╚══╗ ║╚═╝║ ╔╝╚╗ ║║║║  ║╚═╝║')
    strings.push('  ╚╝   ╚══╝ ╚╝╚╝ ╚╝  ╚╝ ╚═══╝ ╚═══╝ ╚══╝ ╚╝╚╝  ╚═══╝')
    strings.push('             - wonderful nodejs task manager        ')
  }
  const v =
    packageJson.version + new Array(10 - packageJson.version.length).join(' ')
  const commonSpace = onlyVersion ? '  ' : '                           '
  strings.push(commonSpace + '╔═══════════════╗  ')
  strings.push(commonSpace + '║    v' + v + ' ║  ')
  strings.push(commonSpace + '╚═══════════════╝  ')
  return strings.join('\r\n')
}

module.exports.getLogoWithVersion = getLogoWithVersion
