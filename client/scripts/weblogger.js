// window.WebLogger = ()()

class WebLogger {
  watchTaskLogsScrollTop = true
  autoScrollButton
  loggerId
  element
  ansiUp

  scrollTo(direction, animate, scrollPixels) {
    const scrollTop = scrollPixels
      ? $(this.element).scrollTop()
      : direction === 'bottom'
      ? this.element.scrollHeight
      : 0
    if (scrollPixels) {
      $(this.element).scrollTop(
        direction === 'bottom'
          ? scrollTop - scrollPixels
          : scrollTop + scrollPixels
      )
    } else if (animate) {
      $(this.element).animate({ scrollTop }, animate)
    } else {
      this.element.scrollTop = scrollTop
    }
  }

  createHTMLLog(logData) {
    const log = this.ansiUp.ansi_to_html(
      logData.replace(/\n/g, '<br>').replace(/ /g, '&ensp;')
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
      .replace(/(<span class="ansi-bright-black-fg">.<\/span>)/g, () =>
        createSpan('ansi-bright-black-fg mocha-test', '.')
      )
      .replace(/(<span class="ansi-red-fg">!<\/span>)/g, () =>
        createSpan('ansi-red-fg mocha-test', '!')
      )
  }

  push(log, isRaw) {
    this.element.insertAdjacentHTML(
      'beforeend',
      isRaw ? log : this.createHTMLLog(log)
    )
  }
  clear() {
    while (this.element.lastChild) {
      this.element.removeChild(this.element.lastChild)
    }
  }
  updateEnvs(envs) {
    if (_.keys(envs).length) {
      const container = document.createElement('div')
      container.classList.add('envs-log')
      container.innerHTML =
        _.map(
          envs,
          (value, key) =>
            `${createSpan('ansi-bright-magenta-fg', key)}=${createEnvsInput(
              key,
              value
            )}`
        ).join(', ') +
        createButton('logs-button', 'edit', 'global.enableEnvsForm()') +
        createButton('logs-button cancel', 'times', 'global.cancelEnvs()') +
        createButton('logs-button apply', 'check', 'global.updateEnvs()')
      this.element.appendChild(container)
    }
  }
  updateDescription(description) {
    const container = createEl('div', { className: 'task-data' })
    const span = createEl('span', { innerText: description })
    container.appendChild(span)
    this.element.appendChild(container)
  }

  onScroll() {
    toggleClass(this, 'scrolling', this.scrollTop > 70)
  }

  triggerScrollWatcher() {
    scrollTo('bottom', '1500')
    this.watchTaskLogsScrollTop = !this.watchTaskLogsScrollTop
    toggleClass(this.autoScrollButton, 'active', this.watchTaskLogsScrollTop)
  }

  createScrollActions(parent) {
    const scrollActions = createEl('div', {
      className: 'scroll-actions',
      parent,
    })
    createEl('button', {
      className: 'logs-button scroll-top',
      onclick: () => scrollTo('top', '500'),
      innerHTML: '<i class="fas fa-angle-double-down"></i>',
      parent: scrollActions,
    })
    createEl('button', {
      className: 'logs-button clear',
      onclick: () => window.global.clearLogs(this.loggerId),
      innerHTML: '<i class="fas fa-eraser"></i>',
      parent: scrollActions,
    })
    this.autoScrollButton = createEl('button', {
      className: `logs-button autoscroll ${
        this.watchTaskLogsScrollTop ? 'active' : ''
      }`,
      onclick: () => this.triggerScrollWatcher(),
      innerHTML: '<i class="fas fa-angle-double-down"></i>',
      parent: scrollActions,
    })
  }

  constructor(logsContainer, id) {
    this.loggerId = id
    const wrapper = createEl('div', {
      className: 'logs-wrapper',
      parent: logsContainer,
    })
    this.createScrollActions(wrapper)
    this.element = createEl('div', {
      className: 'logs-container',
      parent: wrapper,
      onscroll: this.onScroll,
    })
    this.ansiUp = new AnsiUp()
    this.ansiUp.use_classes = true
    this.ansiUp.escape_for_html = false
  }
}

export default WebLogger
