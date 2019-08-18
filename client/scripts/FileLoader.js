import _ from 'lodash'
import { createEl, el } from '../helpers/dom_utils'

export default new (class FileLoader {
  setAttribute = (element, attribute) => {
    const key = _.first(_.keys(attribute))
    element.setAttribute(key, attribute[key])
  }

  createLink(filename, attribute) {
    const link = createEl('link', {
      type: 'text/css',
      rel: 'stylesheet',
      href: `styles/${filename}`,
    })
    if (attribute) this.setAttribute(link, attribute)
    return link
  }

  createScript(filename, attribute) {
    const script = createEl('script', {
      src: `scripts/${filename}`,
    })
    if (attribute) this.setAttribute(script, attribute)
    return script
  }

  appendTo(tagName, appendElement) {
    setTimeout(function() {
      el(tagName).appendChild(appendElement)
    }, 0)
  }

  removeFile(filename) {
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

  loadFile(filename, toRemove, attribute) {
    if (toRemove) this.removeFile(filename)
    else {
      if (filename.includes('.css')) {
        this.appendTo('head', this.createLink(filename, attribute))
      }
      if (filename.includes('.js')) {
        this.appendTo('body', this.createScript(filename, attribute))
      }
    }
  }
})()
