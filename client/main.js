window.global = (function() {
  let watchTaskLogsScrollTop = true
  let theme
  let logger
  let taskList
  let previousEnvs = null
  let hotKeysEnabled = false
  let notificationsEnabled = false
  let fullscreen = false
  let projectName = 'flamebird'

  function showTaskList() {
    $(document.body).toggleClass('task-list-showed')
  }

  function runAllTasks() {
    _.each(
      taskList.getAllFromActiveTab({ isRun: false }),
      ({ isRun, id, isActive }) => {
        taskList.updateTask(id, isRun, isActive, true, false)
        kinka.post(`/run/${id}`)
      }
    )
  }

  function stopAllTasks() {
    _.each(
      taskList.getAllFromActiveTab({ isRun: true }),
      ({ isRun, id, isActive }) => {
        taskList.updateTask(id, isRun, isActive, false, true)
        kinka.post(`/stop/${id}`)
      }
    )
  }

  function clearLogs(activeTask) {
    if (!activeTask) {
      activeTask = taskList.getActive()
    }
    if (_.isString(activeTask)) {
      activeTask = taskList.getTask(activeTask)
    }
    kinka.post(`/clear-logs/${activeTask.id}`)
    activeTask.logs = []
    logger.clear()
    logger.updateDescription(activeTask.task)
    logger.updateEnvs(activeTask.envs)
  }

  function triggerScrollWatcher(e) {
    logger.scrollTo('bottom', '1500')
    watchTaskLogsScrollTop = !watchTaskLogsScrollTop
    $('.logs-button.autoscroll').toggleClass('active', watchTaskLogsScrollTop)
  }

  function handleClickTab(tab) {
    if (tab !== Tabs.getActive().name) {
      Tabs.setActive(tab)
    }
  }

  function enableEnvsForm() {
    el('.envs-log').classList.add('active')
    previousEnvs = _.clone(taskList.getActive().envs)
  }

  function updateEnvs() {
    el('.envs-log').classList.remove('active')
    const activeTask = taskList.getActive()
    _.each(el('.envs-log > input', true), function(el) {
      const input = $(el)
      previousEnvs[input.attr('key')] = input.val()
    })
    activeTask.envs = _.clone(previousEnvs)
    clearLogs(activeTask)
    kinka.post('/update-envs', {
      id: activeTask.id,
      envs: _.clone(previousEnvs),
    })
    taskList.updateTask(activeTask.id, true, activeTask.isActive, true, false)
    previousEnvs = null
  }

  function cancelEnvs() {
    el('.envs-log').classList.remove('active')
    _.each(el('.envs-log > input', true), el => {
      const input = $(el)
      input.val(previousEnvs[input.attr('key')])
    })
    taskList.getActive().envs = _.clone(previousEnvs)
    previousEnvs = null
  }

  async function updateTaskLogs({ task, envs, id }) {
    logger.clear()
    const { data: rawLogs } = await kinka.get(`/logs/${id}`)
    logger.updateDescription(task)
    logger.updateEnvs(envs)
    const logs = _.map(rawLogs, logger.createHTMLLog).join('')
    setTimeout(function() {
      logger.push(logs, true)
      logger.scrollTo('bottom')
    }, 0)
  }

  function openTask(id) {
    // const active = taskList.getActive()
    // if (!active || id !== active.id) {
    const task = taskList.getTask(id)
    if (task.id) {
      if (notificationsEnabled) taskList.setUpdated(id, false)
      taskList.setActive(task)
      updateTaskLogs(task)
    }
    // }
  }
  function runTask(id) {
    window.event.stopPropagation()
    const task = taskList.getTask(id)
    if (!task.isLaunching && !task.isRun) {
      taskList.setActive(task, true)
      updateTaskLogs(task)
      kinka.post('/run/' + task.id)
    }
  }
  function stopTask(id) {
    window.event.stopPropagation()
    const task = taskList.getTask(id)
    if (!task.isLaunching && task.isRun) {
      taskList.updateTask(task.id, false, task.isActive, false, true)
      kinka.post('/stop/' + task.id)
    }
  }

  function setTheme(newTheme) {
    localStorage.setItem('theme', newTheme)
    if (newTheme !== 'white') {
      FileLoader(newTheme + '-theme.css')
    }
    document.body.setAttribute('theme', newTheme)
    theme = newTheme
  }

  function switchTheme() {
    const newTheme = theme === 'dark' ? 'white' : 'dark'
    if (theme !== 'white') {
      FileLoader(`${theme}-theme.css`, true)
    }
    setTheme(newTheme)
  }

  function toggleNotifications() {
    notificationsEnabled = !notificationsEnabled
    updateNotifications()
  }

  function updateNotifications() {
    toggleClass(
      el('.main-button.notifications'),
      'active',
      notificationsEnabled
    )
    if (notificationsEnabled) {
      localStorage.setItem('notifications', true)
    } else {
      delete localStorage['notifications']
      $('.task.updated').removeClass('updated')
    }
  }

  function toggleHotKeys() {
    hotKeysEnabled = !hotKeysEnabled
    updateHotkeys()
  }

  function updateHotkeys() {
    if (!hotKeysEnabled && window.HotKeys) {
      HotKeys.setEnabled(false)
      window.HotKeys = null
    }
    toggleClass(el('.main-button.hot-keys'), 'active', hotKeysEnabled)
    FileLoader('hot_keys-shortcuts.css', !hotKeysEnabled)
    FileLoader('hot_keys.js', !hotKeysEnabled)
    if (hotKeysEnabled) {
      localStorage.setItem('hotkeys', true)
    } else {
      delete localStorage['hotkeys']
    }
  }

  function updateFullscreen() {
    toggleClass(el('.main-button.resize'), 'active', fullscreen)
    FileLoader('fullscreen.css', !fullscreen, {
      media: 'screen and (min-width: 923px)',
    })
    if (fullscreen) {
      localStorage.setItem('fullscreen', true)
    } else {
      delete localStorage['fullscreen']
    }
  }

  function toggleResize() {
    fullscreen = !fullscreen
    updateFullscreen()
  }

  let pageIsNotActive = false
  $(window).focus(function() {
    pageIsNotActive = false
    if (notificationsEnabled) {
      taskList.setUpdated(taskList.getActive().id, false)
    }
  })

  $(window).blur(function() {
    pageIsNotActive = true
  })
  const receiveWsMessage = ({ data }) => {
    const { name, id, isRun, isLaunching, isStopping, log } = JSON.parse(data)
    if (name) {
      const isActive = id === taskList.getActive().id
      taskList.updateTask(id, isRun, isActive, isLaunching, isStopping)
      if (log) {
        if (isActive) {
          logger.push(log)
          if (watchTaskLogsScrollTop) logger.scrollTo('bottom')
          if (notificationsEnabled && pageIsNotActive) {
            taskList.setUpdated(id, true, {
              notify: notificationsEnabled,
              projectName,
              log,
            })
          }
        } else if (notificationsEnabled) {
          taskList.setUpdated(id, true, {
            notify: notificationsEnabled,
            log,
            projectName,
          })
        }
      }
    }
  }

  async function showProjectVersion() {
    const { data: version } = await kinka.get('/project-version')
    if (version) {
      $('header > .title').html(
        projectName + createSpan('project-version', version)
      )
    }
  }

  function hideProjectVersion() {
    $('header > .title').text(projectName)
  }

  $(document).ready(async function() {
    setTheme(localStorage.getItem('theme') || 'white')
    fullscreen = !!localStorage.getItem('fullscreen')
    hotKeysEnabled = !!localStorage.getItem('hotkeys')
    notificationsEnabled = !!localStorage.getItem('notifications')
    updateFullscreen()
    updateHotkeys()
    updateNotifications()
    const { data: { name, commands } } = await kinka.get('/info')
    projectName = name
    if (projectName) {
      $('title').text(`${projectName} | fb`)
      $('header > .title')
        .text(projectName)
        .on('mouseover', showProjectVersion)
        .on('mouseleave', hideProjectVersion)
    }
    taskList = window.taskList = new TaskList(el('#task-list'), commands)
    logger = new WebLogger(el('#task-logs'))
    const ws = new WebSocket(`ws://${location.host}`)
    ws.onmessage = receiveWsMessage
  })

  return {
    cancelEnvs: cancelEnvs,
    clearLogs: clearLogs,
    enableEnvsForm: enableEnvsForm,
    handleClickTab: handleClickTab,
    openTask: openTask,
    runAllTasks: runAllTasks,
    runTask: runTask,
    showTaskList: showTaskList,
    stopAllTasks: stopAllTasks,
    stopTask: stopTask,
    switchTheme: switchTheme,
    getLogger: () => logger,
    getTaskList: () => taskList,
    toggleHotKeys: toggleHotKeys,
    toggleNotifications: toggleNotifications,
    toggleResize: toggleResize,
    triggerScrollWatcher: triggerScrollWatcher,
    updateEnvs: updateEnvs,
  }
})()
