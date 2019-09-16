const _ = require('lodash')

const memCache = {}

const getCache = (key, defaultValue) =>
  _.isUndefined(memCache[key]) ? defaultValue || null : memCache[key]

const setToCache = (key, value) => (memCache[key] = value)

module.exports = {
  get: getCache,
  set: setToCache,
}
