const _ = require('lodash')

const storage = {}

const getFromStorage = (key, defaultValue) =>
  _.isUndefined(storage[key]) ? defaultValue || null : storage[key]

const setToStorage = (key, value) => (storage[key] = value)

module.exports = {
  get: getFromStorage,
  set: setToStorage,
}
