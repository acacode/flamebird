const _ = require('lodash')

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

module.exports.splitStringOnEnvs = splitStringOnEnvs
