const _ = require('lodash')
const fs = require('fs')
const storage = require('./storage')

function splitStringOnEnvs(str) {
  return _.reduce(
    str.split(' '),
    function(task, substr, index, array) {
      if (/([a-zA-Z]{1,})=([a-zA-Z0-9]{1,})/.test(substr)) {
        _.assign(task.envs, _.fromPairs([substr.split('=')]))
      } else {
        task.string.push(substr)
      }
      if (index === array.length - 1) {
        task.string = task.string.join(' ')
      }
      return task
    },
    {
      string: [],
      envs: {},
    }
  )
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
