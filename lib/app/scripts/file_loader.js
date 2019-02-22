/* global  _ el, createEl,  */

window.FileLoader = (function() {// eslint-disable-line

  const setAttribute = (element, attribute) => {
    var key = _.first(_.keys(attribute))
    element.setAttribute(key, attribute[key])
  }

  function createLink(filename, attribute) {
    const link = createEl('link', {
      type: 'text/css',
      rel: 'stylesheet',
      href: `styles/${filename}`,
    })
    if (attribute) setAttribute(link, attribute)
    return link
  }

  function createScript(filename, attribute) {
    const script = createEl('script', {
      src: `scripts/${filename}`,
    })
    if (attribute) setAttribute(script, attribute)
    return script
  }

  function appendTo(tagName, appendElement) {
    setTimeout(function() {
      el(tagName).appendChild(appendElement)
    }, 0)
  }

  function removeFile(filename) {
    setTimeout(function() {
      let element = null
      if (filename.includes('.css')) {
        element = el(`link[href="styles/${filename}"]`)
      }
      if (filename.includes('.js')) {
        element = el(`script[src="scripts/${filename}"]`)
      }
      if (element) {
        element.parentElement.removeChild(element)
      }
    }, 0)
  }

  return function(filename, toRemove, attribute) {
    if (toRemove) removeFile(filename)
    else {
      if (filename.includes('.css')) {
        appendTo('head', createLink(filename, attribute))
      }
      if (filename.includes('.js')) {
        appendTo('body', createScript(filename, attribute))
      }
    }
  }
})()
