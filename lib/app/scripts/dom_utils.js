/* global $,  _  */
function createButton(classes, icon, onClick, asJqElement, innerText) {// eslint-disable-line
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

function createSpan(classes, text) {
  return '<span class="' + (classes || '') + '">' + text + '</span>'
}

function funcToStr(func) { // eslint-disable-line
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

function createDiv(// eslint-disable-line
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

function createEnvsInput(key, value) {// eslint-disable-line
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
