/* global  _ */

window.FileLoader = (function() {// eslint-disable-line

  const setAttribute = (element, attribute) => {
    var key = _.first(_.keys(attribute))
    element.setAttribute(key, attribute[key])
  }

  function createLink(filename, attribute) {
    const link = document.createElement('link')
    link.type = 'text/css'
    link.rel = 'stylesheet'
    link.href = `styles/${filename}`
    if (attribute) {
      setAttribute(link, attribute)
    }
    return link
  }

  function createScript(filename, attribute) {
    const script = document.createElement('script')
    script.src = `scripts/${filename}`
    if (attribute) {
      setAttribute(script, attribute)
    }
    return script
  }

  function appendTo(element, appendElement) {
    setTimeout(function() {
      document.getElementsByTagName(element)[0].appendChild(appendElement)
    }, 0)
  }
  function removeFile(filename) {
    setTimeout(function() {
      let element = null
      if (filename.includes('.css')) {
        element = document.querySelector(`link[href="styles/${filename}"]`)
      }
      if (filename.includes('.js')) {
        element = document.querySelector(`script[src="scripts/${filename}"]`)
      }
      if (element) {
        element.parentElement.removeChild(element)
      }
    }, 0)
  }

  return function(filename, isRemove, attribute) {
    if (isRemove) {
      removeFile(filename)
    } else {
      if (filename.includes('.css')) {
        appendTo('head', createLink(filename, attribute))
      }
      if (filename.includes('.js')) {
        appendTo('body', createScript(filename, attribute))
      }
    }
  }
})()
