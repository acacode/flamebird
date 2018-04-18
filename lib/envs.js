const _ = require('lodash')
const platform = require('os').platform()

function splitStringOnEnvs(str) {
  if (platform === 'win32') {
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
  } else {
    return {
      string: str,
      envs: {},
    }
  }
}

module.exports.splitStringOnEnvs = splitStringOnEnvs
