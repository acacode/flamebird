/* global $, axios, _ , fileLoader, WebLogger, ansiUp , createDiv, createButton, funcToStr, createSpan */

function WebLogger(element) {
  this.element = element
  this.containsEnvs = false
  this.element.addEventListener('scroll', function() {
    if (this.scrollTop > 70) {
      this.classList.add('flying')
    } else {
      this.classList.remove('flying')
    }
  })
  WebLogger.scrollTo = WebLogger.scrollTo.bind({
    element: this.element,
  })
  this.createHTMLLog = this.createHTMLLog.bind(this)
  this.push = this.push.bind(this)
  this.clear = this.clear.bind(this)
  this.setTitle = this.setTitle.bind(this)
  this.removeTitle = this.removeTitle.bind(this)
  this.updateEnvs = this.updateEnvs.bind(this)
  this.updateDescription = this.updateDescription.bind(this)
}

WebLogger.scrollTo = function(direction, animate) {
  if (direction === 'bottom') {
    if (animate) {
      $(this.element).animate(
        {
          scrollTop: this.element.scrollHeight,
        },
        '1500'
      )
    } else {
      this.element.scrollTop = this.element.scrollHeight
    }
  }
  if (direction === 'top') {
    $(this.element).animate({ scrollTop: 0 }, '500')
  }
}

WebLogger.prototype.createHTMLLog = function(logData) {
  var log = ansiUp.ansi_to_html(
    logData.replace(/[\n\r]/g, '<br>').replace(/ /g, '&nbsp;')
  )
  if (log.includes('Warning:')) {
    return createSpan('ansi-yellow-fg', log)
  }
  if (log.includes('Exited&nbsp;Successfully')) {
    return createSpan('ended ok', log) + '<br><br>'
  }
  if (log.includes('Exited&nbsp;with&nbsp;exit&nbsp;code&nbsp;')) {
    return createSpan('ended', log) + '<br><br>'
  }
  return log
    .replace(/(<span class="ansi-bright-black-fg">.<\/span>)/g, function(conc) {
      return createSpan('ansi-bright-black-fg mocha-test', '.')
    })
    .replace(/(<span class="ansi-red-fg">!<\/span>)/g, function(conc) {
      return createSpan('ansi-red-fg mocha-test', '!')
    })
}

WebLogger.prototype.push = function(log) {
  this.element.innerHTML += this.createHTMLLog(log)
}
WebLogger.prototype.clear = function(full) {
  while (
    full
      ? this.element.lastChild
      : this.element.children.length > (this.containsEnvs ? 2 : 1)
  ) {
    this.element.removeChild(this.element.lastChild)
  }
}
WebLogger.prototype.setTitle = function(title) {}
WebLogger.prototype.removeTitle = function() {}
WebLogger.prototype.updateEnvs = function(envs) {
  this.containsEnvs = _.keys(envs).length
  if (this.containsEnvs) {
    var container = document.createElement('div')
    container.classList.add('envs-log')
    container.innerHTML =
      _.map(envs, function(value, key) {
        return (
          createSpan('ansi-bright-magenta-fg', key) +
          '=' +
          createEnvsInput(key, value)
        )
      }).join(', ') +
      createButton('logs-button', 'edit', 'enableEnvsForm()') +
      createButton('logs-button cancel', 'times', 'cancelEnvs()') +
      createButton('logs-button apply', 'check', 'updateEnvs()')
    this.element.appendChild(container)
  }
}
WebLogger.prototype.updateDescription = function(description) {
  var container = document.createElement('div')
  container.classList.add('task-data')
  var span = document.createElement('span')
  span.innerText = description
  container.appendChild(span)
  this.element.appendChild(container)
}

function createEnvsInput(key, value) {
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
