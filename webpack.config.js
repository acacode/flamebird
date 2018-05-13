const webpack = require('webpack')
const fs = require('fs')
const _ = require('lodash')
const resolve = require('path').resolve

function getEntries(folder) {
  return fs
    .readdirSync(folder)
    .filter(file => file.match(/.*\.js$/))
    .map(file => {
      return {
        name: file.substring(0, file.length - 3),
        path: folder + file,
      }
    })
    .reduce((memo, file) => {
      memo[file.name] = file.path
      return memo
    }, {})
}
webpack(
  [
    {
      mode: 'production',
      entry: getEntries('./lib/app/'),
      output: {
        path: resolve('./lib/app'),
        filename: '[name].js',
      },
    },
    {
      mode: 'production',
      entry: getEntries('./lib/app/scripts/'),
      output: {
        path: resolve('./lib/app/scripts'),
        filename: '[name].js',
      },
    },
  ],
  (err, stats) => {
    if (err || stats.hasErrors()) {
      console.log(err)
    }
    console.log('Build done!')
  }
)
