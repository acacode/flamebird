/* global $, axios, _ , FileLoader, WebLogger, HotKeys, TaskList, createSpan, toggleClass */

window.global = (function() {
  let watchTaskLogsScrollTop = true
  let theme
  let logger
  let taskList
  let openedTask
  let activeTab = 'Procfile'
  let previousEnvs = null
  let hotKeysEnabled = false
  let fullscreen = false
  let projectName = 'flamebird'

  function showTaskList() {
    $(document.body).toggleClass('task-list-showed')
  }

  function runAllTasks() {
    _.each(taskList.getAllFromActiveTab(), ({ isRun, name, id, isActive }) => {
      if (!isRun) {
        taskList.updateTask(id, isRun, isActive, true, false)
        axios.post(`/run/${name}`)
      }
    })
  }

  function stopAllTasks() {
    _.each(
      taskList.getAllFromActiveTab(true),
      ({ isRun, name, id, isActive }) => {
        taskList.updateTask(id, isRun, isActive, false, true)
        axios.post(`/stop/${name}`)
      }
    )
  }

  function clearLogs(activeTask) {
    if (!activeTask) {
      activeTask = taskList.getActive()
    }
    axios.post('/clear-logs/' + activeTask.name)
    activeTask.logs = []
    logger.clear()
    logger.updateDescription(activeTask.task)
    logger.updateEnvs(activeTask.envs)
  }

  function triggerScrollWatcher(e) {
    logger.scrollTo('bottom', true)
    watchTaskLogsScrollTop = !watchTaskLogsScrollTop
    $('.logs-button.autoscroll').toggleClass('active', watchTaskLogsScrollTop)
  }

  function handleClickTab(tab) {
    if (tab !== activeTab) {
      taskList.changeTab(tab)
    }
  }

  function enableEnvsForm() {
    $('.envs-log').addClass('active')
    previousEnvs = _.clone(taskList.getActive().envs)
  }

  function updateEnvs() {
    $('.envs-log').removeClass('active')
    const activeTask = taskList.getActive()
    _.each($('.envs-log > input'), function(el) {
      const input = $(el)
      previousEnvs[input.attr('key')] = input.val()
    })
    activeTask.envs = _.clone(previousEnvs)
    clearLogs(activeTask)
    axios.post('/update-envs', {
      name: activeTask.name,
      envs: _.clone(previousEnvs),
    })
    taskList.updateTask(activeTask.id, true, activeTask.isActive, true, false)
    previousEnvs = null
  }

  function cancelEnvs() {
    $('.envs-log').removeClass('active')
    _.each($('.envs-log > input'), el => {
      const input = $(el)
      input.val(previousEnvs[input.attr('key')])
    })
    taskList.getActive().envs = _.clone(previousEnvs)
    previousEnvs = null
  }

  async function updateTaskLogs({ task, envs, name }) {
    logger.clear()
    const { data: rawLogs } = await axios.get(`/logs/${name}`)
    logger.updateDescription(task)
    logger.updateEnvs(envs)
    const logs = _.map(rawLogs, logger.createHTMLLog).join('')
    setTimeout(function() {
      logger.push(logs, true)
      logger.scrollTo('bottom')
    }, 0)
  }

  function openTask(id) {
    if (id !== openedTask) {
      const task = taskList.getTask(id)
      if (task.id) {
        taskList.setActive(task)
        openedTask = id
        updateTaskLogs(task)
      }
    }
  }
  function runTask(id) {
    window.event.stopPropagation()
    const task = taskList.getTask(id)
    if (!task.isStartRunning && !task.isRun) {
      taskList.setActive(task, true)
      if (id !== openedTask) {
        openedTask = id
        updateTaskLogs(task)
      }
      axios.post('/run/' + task.name)
    }
  }
  function stopTask(id) {
    window.event.stopPropagation()
    const task = taskList.getTask(id)
    if (!task.isStartRunning && task.isRun) {
      taskList.updateTask(task.id, false, task.isActive, false, true)
      axios.post('/stop/' + task.name)
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

  function toggleHotKeys() {
    hotKeysEnabled = !hotKeysEnabled
    updateHotkeys()
  }

  function updateHotkeys() {
    if (!hotKeysEnabled && window.HotKeys) {
      HotKeys.setEnabled(false)
      window.HotKeys = null
    }
    toggleClass(
      document.querySelector('.main-button.hot-keys'),
      'active',
      hotKeysEnabled
    )
    FileLoader('hot_keys-shortcuts.css', !hotKeysEnabled)
    FileLoader('hot_keys.js', !hotKeysEnabled)
    if (hotKeysEnabled) {
      localStorage.setItem('hotkeys', true)
    } else {
      delete localStorage['hotkeys']
    }
  }

  function updateFullscreen() {
    toggleClass(
      document.querySelector('.main-button.resize'),
      'active',
      fullscreen
    )
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

  const receiveWsMessage = ({ data }) => {
    const { name, isRun, isStartRunning, isStopping, log, isNPM } = JSON.parse(
      data
    )
    if (name) {
      const taskId = (isNPM ? 'npm' : 'procfile') + '-' + name
      const isActive = taskId === taskList.getActive().id
      taskList.updateTask(taskId, isRun, isActive, isStartRunning, isStopping)
      if (log && isActive) {
        logger.push(log)
        if (watchTaskLogsScrollTop) logger.scrollTo('bottom')
      }
    }
  }

  async function showProjectVersion() {
    const { data: version } = await axios.get('/project-version')
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
    updateFullscreen()
    hotKeysEnabled = !!localStorage.getItem('hotkeys')
    updateHotkeys()
    logger = new WebLogger(document.getElementById('task-logs'))
    const {
      data: { appName, commands },
    } = await axios.get('/info')
    projectName = appName
    if (projectName) {
      $('title').text(`${projectName} | fb`)
      $('header > .title')
        .text(projectName)
        .on('mouseover', showProjectVersion)
        .on('mouseleave', hideProjectVersion)
    }
    taskList = window.taskList = new TaskList(
      document.getElementById('tasks'),
      commands
    )
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
    toggleHotKeys: toggleHotKeys,
    toggleResize: toggleResize,
    triggerScrollWatcher: triggerScrollWatcher,
    updateEnvs: updateEnvs,
  }
})()
