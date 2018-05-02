var storage = {}

module.exports.get = function(key, defaultValue) {
  return storage[key] || defaultValue || null
}
module.exports.set = function(key, value) {
  if (key === 'actionArgs') {
    storage[key] = {
      web: value.web,
      name: value.name,
    }
  } else {
    storage[key] = value
  }
  return storage[key]
}
