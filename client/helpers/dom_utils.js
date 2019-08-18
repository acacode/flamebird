import $ from 'jquery'
import _ from 'lodash'

export const createButton = function(
  classes,
  icon,
  onClick,
  asJqElement,
  innerText
) {
  let button
  if (asJqElement) {
    button = $('<button></button>')
    button.addClass(classes)
    if (icon) {
      const iconEl = $('<i class="fas fa-' + icon + '"></i>')
      button.html(iconEl)
    }
    if (innerText) {
      button.append(window.createSpan('', innerText))
    }
    if (onClick) {
      button.on('click', onClick)
    }
  } else {
    button =
      '<button ' +
      (onClick ? 'onclick="' + onClick + '"' : '') +
      ' class="' +
      classes +
      '">' +
      (icon ? '<i class="fas fa-' + icon + '"></i>' : '') +
      (innerText || '') +
      '</button>'
  }

  return button
}

export const createSpan = function(classes, text) {
  return '<span class="' + (classes || '') + '">' + text + '</span>'
}

export const funcToStr = function(func) {
  const args = _.slice(arguments, 1)
  return (
    func.name +
    '(' +
    _(args)
      .map(function(arg) {
        switch (typeof arg) {
          case 'string':
            return "'" + arg + "'"
          default:
            return arg
        }
      })
      .join(',') +
    ')'
  )
}

export const createDiv = function(
  classes,
  innerText,
  icon,
  id,
  onClick,
  asJqElement
) {
  let element =
    '<div ' +
    (id ? "id='" + id + "'" : '') +
    (onClick && !asJqElement ? 'onclick="' + onClick + '"' : '') +
    ' class="' +
    classes +
    '">' +
    (icon ? '<i class="fas fa-' + icon + '"></i>' : '') +
    (innerText || '') +
    '</div>'
  if (asJqElement) {
    element = $(element)
    if (onClick) {
      element.on('click', onClick)
    }
  }
  return element
}

export const createEnvsInput = function(key, value) {
  return (
    '<input class="env-value ansi-bright-blue-fg" onkeypress="this.style.width = ((this.value.length + 1) * 8) + \'px\';" key="' +
    key +
    '" value="' +
    value +
    '" style="width:' +
    ((value.length + 1) * 5.1 + 4) +
    'px;"/>'
  )
}

export const toggleClass = (element, className, isShow) =>
  element && element.classList[isShow ? 'add' : 'remove'](className)

export const addClass = (element, className) =>
  element && element.classList.add(className)

export const removeClass = (element, className) =>
  element && element.classList.remove(className)

export const el = (query, asList) =>
  document[`querySelector${asList ? 'All' : ''}`](query)

export const createEl = (tag, options) => {
  const element = document.createElement(tag)
  _.each(options, (option, name) => {
    if (name !== 'parent') element[name] = option
  })
  if (options.parent) {
    const parentElement = _.isString(options.parent)
      ? window.el(options.parent)
      : options.parent
    parentElement.appendChild(element)
  }
  return element
}
