const _ = require('lodash')
const fs = require('fs')
const storage = require('./storage')

function splitStringOnEnvs(str) {
  var substrings = []
  var envs = {}
  _.forEach(str.split(' '), function(substr) {
    if (/([a-zA-Z]{1,})=([a-zA-Z0-9]{1,})/.test(substr)) {
      _.assign(envs, _.fromPairs([substr.split('=')]))
    } else {
      substrings.push(substr)
    }
  })
  return {
    string: substrings.join(' '),
    envs: envs,
  }
}

function load(filename) {
  var envFile = {}
  try {
    var data = fs.readFileSync(filename)
    envFile = _.reduce(
      _.compact(data.toString().split(/[\n\r]/g)),
      function(envFile, line) {
        var splitted = line.split('=')
        envFile[splitted[0]] = splitted[1]
        return envFile
      },
      {}
    )
  } catch (e) {
    console.warn('.ENV file not found')
  }
  return storage.set('envFile', envFile)
}

module.exports.splitStringOnEnvs = splitStringOnEnvs
module.exports.load = load
