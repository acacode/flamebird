/* global jQuery,  _ ,  createButton, AnsiUp, createSpan, createEnvsInput, toggleClass */
window.WebLogger = (function($) {// eslint-disable-line
  var element
  var containsEnvs = false
  var ansiUp

  function scrollTo(direction, animate) {
    if (direction === 'bottom') {
      const scrollTop = element.scrollHeight
      if (animate) {
        $(element).animate(
          { scrollTop },
          '1500'
        )
      } else {
        element.scrollTop = scrollTop
      }
    }
    if (direction === 'top') {
      $(element).animate({ scrollTop: 0 }, '500')
    }
  }

  function createHTMLLog(logData) {
    const log = ansiUp.ansi_to_html(
      logData.replace(/[\n\r]/g, '<br>').replace(/ /g, '&ensp;')
    )
    if (log.includes('Warning:')) {
      return createSpan('ansi-yellow-fg', log)
    }
    if (log.includes('Exited&ensp;Successfully')) {
      return createSpan('ended ok', log)
    }
    if (log.includes('Exited&ensp;with&ensp;exit&ensp;code&ensp;')) {
      return createSpan('ended', log)
    }
    return log
      .replace(/(<span class="ansi-bright-black-fg">.<\/span>)/g, ()=> createSpan('ansi-bright-black-fg mocha-test', '.'))
      .replace(/(<span class="ansi-red-fg">!<\/span>)/g, ()=> createSpan('ansi-red-fg mocha-test', '!'))
  }

  function push(log, isRaw) {
    element.insertAdjacentHTML('beforeend', isRaw ? log : this.createHTMLLog(log))
  }
  function clear() {
    while (element.lastChild) {
      element.removeChild(element.lastChild)
    }
  }
  function updateEnvs(envs) {
    hasEnvs = _.keys(envs).length
    if (hasEnvs) {
      const container = document.createElement('div')
      container.classList.add('envs-log')
      container.innerHTML =
        _.map(envs, (value, key) => (
          `${createSpan('ansi-bright-magenta-fg', key)}=${createEnvsInput(key, value)}`
        )).join(', ') +
        createButton('logs-button', 'edit', 'global.enableEnvsForm()') +
        createButton('logs-button cancel', 'times', 'global.cancelEnvs()') +
        createButton('logs-button apply', 'check', 'global.updateEnvs()')
      element.appendChild(container)
    }
  }
  function updateDescription(description) {
    const container = document.createElement('div')
    container.classList.add('task-data')
    const span = document.createElement('span')
    span.innerText = description
    container.appendChild(span)
    element.appendChild(container)
  }

  function onScroll() {
    toggleClass(this, 'flying', this.scrollTop > 70)
  }

  return function WebLogger(el) {
    element = el
    element.addEventListener('scroll', onScroll)
    ansiUp = new AnsiUp()
    ansiUp.use_classes = true
    ansiUp.escape_for_html = false
    return {
      scrollTo: scrollTo,
      createHTMLLog: createHTMLLog,
      push: push,
      clear: clear,
      updateEnvs: updateEnvs,
      updateDescription: updateDescription,
    }
  }
})(jQuery)
