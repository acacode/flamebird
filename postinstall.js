const { yellow } = require('./lib/utils/colors')

let strings = []
strings.push(yellow('╔═════════════════════════════════════╗'))
strings.push(yellow('║    Thanks for using Flamebird.js    ║'))
strings.push(yellow('╚═════════════════════════════════════╝'))
console.log('\r\n' + strings.join('\r\n') + '\r\n')
