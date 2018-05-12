/* global $,  _  */
window.createButton = function(classes, icon, onClick, asJqElement, innerText) {// eslint-disable-line
  var button
  if (asJqElement) {
    button = $('<button></button>')
    button.addClass(classes)
    if (icon) {
      var iconEl = $('<i class="fas fa-' + icon + '"></i>')
      button.html(iconEl)
    }
    if (innerText) {
      button.append(createSpan('', innerText))
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

window.createSpan = function(classes, text) {
  return '<span class="' + (classes || '') + '">' + text + '</span>'
}

window.funcToStr = function(func) { // eslint-disable-line
  var args = _.slice(arguments, 1)
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

window.createDiv = function(// eslint-disable-line
  classes,
  innerText,
  icon,
  id,
  onClick,
  asJqElement
) {
  var element =
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

window.createEnvsInput = function(key, value) {// eslint-disable-line
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
