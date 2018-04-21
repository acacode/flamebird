var storage = {}

module.exports.get = function(key, defaultValue) {
  return storage[key] || defaultValue || null
}
module.exports.set = function(key, value) {
  storage[key] = value
  return storage[key]
}
