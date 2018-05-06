/* global jQuery */

var FileLoader = (function($) {// eslint-disable-line
  function createLink(filename) {
    var link = document.createElement('link')
    link.type = 'text/css'
    link.rel = 'stylesheet'
    link.href = 'styles/' + filename
    return link
  }

  function createScript(filename) {
    var script = document.createElement('script')
    script.src = 'scripts/' + filename
    return script
  }

  function appendTo(element, appendElement) {
    setTimeout(function() {
      document.getElementsByTagName(element)[0].appendChild(appendElement)
    }, 0)
  }
  function removeFile(filename) {
    setTimeout(function() {
      var element = null
      if (filename.includes('.css')) {
        element = document.querySelector('link[href="styles/' + filename + '"]')
      }
      if (filename.includes('.js')) {
        element = document.querySelector(
          'script[src="scripts/' + filename + '"]'
        )
      }
      if (element) {
        element.parentElement.removeChild(element)
      }
    }, 0)
  }

  return function(filename, remove) {
    if (remove) {
      removeFile(filename)
    } else {
      if (filename.includes('.css')) {
        // $('[href="styles/'+filename+'"]')
        appendTo('head', createLink(filename))
      }
      if (filename.includes('.js')) {
        appendTo('body', createScript(filename))
      }
    }
  }
})(jQuery)
