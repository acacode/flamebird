const fs = require('fs')
const resolve = require('path').resolve

function getEntries() {
  return fs
    .readdirSync('./lib/app/')
    .filter(file => file.match(/.*\.js$/))
    .map(file => {
      return {
        name: file.substring(0, file.length - 3),
        path: './lib/app/' + file,
      }
    })
    .reduce((memo, file) => {
      memo[file.name] = file.path
      return memo
    }, {})
}

const config = {
  mode: 'production',
  entry: getEntries(),
  output: {
    path: resolve('./lib/app'),
    filename: '[name].js',
  },
}

module.exports = config
