const _ = require('lodash')
const fs = require('fs')
const storage = require('./storage')

const separateEnvsFromString = str =>
  _.reduce(
    str.split(' '),
    (result, stringPart, index, array) => {
      if (
        /^([a-zA-Z]{1,2}[a-zA-Z_0-9]{1,})=([a-zA-Z0-9]{1,})$/.test(stringPart)
      ) {
        _.assign(result.envs, _.fromPairs([stringPart.split('=')]))
      } else {
        result.string.push(stringPart)
      }
      if (index === array.length - 1) {
        result.string = result.string.join(' ')
      }
      return result
    },
    {
      string: [],
      envs: {},
    }
  )

const load = filename => {
  var envFile = {}
  try {
    var data = fs.readFileSync(filename)
    envFile = _.reduce(
      _.compact(data.toString().split(/[\n\r]/g)),
      (envFile, line) => {
        const variable = line.split('=')
        envFile[variable[0]] = variable[1]
        return envFile
      },
      {}
    )
  } catch (e) {
    console.warn('.ENV file not found')
  }
  return storage.set('envFile', envFile)
}

module.exports = {
  separateEnvsFromString: separateEnvsFromString,
  load: load,
}
