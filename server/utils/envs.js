const _ = require('lodash')
const fs = require('fs')

const separateEnvsFromString = str =>
  _.reduce(
    str.split(' '),
    (task, substr, index, array) => {
      if (/^([a-zA-Z]{1,2}[a-zA-Z_0-9]{1,})=([a-zA-Z0-9]{1,})$/.test(substr)) {
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

const getDataFromEnvFile = filename => {
  let envFile = {}
  try {
    const data = fs.readFileSync(filename)
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
  return envFile
}

module.exports = {
  separateEnvsFromString,
  getDataFromEnvFile,
}
