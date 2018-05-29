/* global $, axios, _ , FileLoader, WebLogger, Keyboard, TaskList, createSpan */

window.global = (function() {
  var watchTaskLogsScrollTop = true
  var theme
  var logger
  var taskList
  var openedTask
  var activeTab = 'Procfile'
  var previousEnvs = null

  function showTaskList() {
    document.body.classList[
      document.body.classList.contains('task-list-showed') ? 'remove' : 'add'
    ]('task-list-showed')
  }

  function runAllTasks(e) {
    _.forEach(taskList.getAllFromActiveTab(), function(t) {
      taskList.updateTask(t.name, t.isRun, t.isActive, true, false)
      axios.post('/run/' + t.name)
    })
  }

  function stopAllTasks(e) {
    _.forEach(taskList.getAllFromActiveTab(true), function(t) {
      taskList.updateTask(t.name, t.isRun, t.isActive, false, true)
      axios.post('/stop/' + t.name)
    })
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
    var activeTask = taskList.getActive()
    _.each($('.envs-log > input'), function(el) {
      var input = $(el)
      previousEnvs[input.attr('key')] = input.val()
    })
    activeTask.envs = _.clone(previousEnvs)
    clearLogs(activeTask)
    axios.post('/update-envs', {
      name: activeTask.name,
      envs: _.clone(previousEnvs),
    })
    previousEnvs = null
  }
  function cancelEnvs() {
    $('.envs-log').removeClass('active')
    _.each($('.envs-log > input'), function(el) {
      var input = $(el)
      input.val(previousEnvs[input.attr('key')])
    })
    taskList.getActive().envs = _.clone(previousEnvs)
    previousEnvs = null
  }

  function updateTaskLogs(task) {
    logger.clear()
    axios.get('/logs/' + task.name).then(function(response) {
      logger.updateDescription(task.task)
      logger.updateEnvs(task.envs)
      var logs = ''
      _.forEach(response.data, function(log, index) {
        logs += logger.createHTMLLog(log)
      })
      setTimeout(function() {
        logger.push(logs, true)
        logger.scrollTo('bottom')
      }, 0)
    })
  }

  function openTask(name) {
    if (name !== openedTask) {
      var task = taskList.getTask(name)
      if (task.name) {
        taskList.setActive(task)
        openedTask = name
        updateTaskLogs(task)
      }
    }
  }
  function runTask(name) {
    window.event.stopPropagation()
    var task = taskList.getTask(name)
    if (!task.isStartRunning && !task.isRun) {
      taskList.setActive(task, true)
      if (name !== openedTask) {
        openedTask = name
        updateTaskLogs(task)
      }
      axios.post('/run/' + task.name)
    }
  }
  function stopTask(name) {
    window.event.stopPropagation()
    var task = taskList.getTask(name)
    if (!task.isStartRunning && task.isRun) {
      // var taskButton = $('#' + task.name)
      taskList.updateTask(task.name, false, task.isActive, false, true)
      // taskButton.addClass('stopping')
      axios.post('/stop/' + task.name)
    }
  }

  function setTheme(newTheme) {
    if (newTheme !== theme) {
      localStorage.setItem('theme', newTheme)
      if (theme !== 'white') {
        FileLoader(theme + '-theme.css', true)
      }
      $('.menu-item.' + theme).removeClass('active')
      $('.menu-item.' + newTheme).addClass('active')
      if (newTheme !== 'white') {
        FileLoader(newTheme + '-theme.css')
      }
      document.body.setAttribute('theme', newTheme)
      theme = newTheme
    }
  }

  var keyboardEnabled = false
  var fullscreen = false

  function toggleKeyboard() {
    keyboardEnabled = !keyboardEnabled
    updateHotkeys()
  }

  function updateHotkeys() {
    if (!keyboardEnabled && window.Keyboard) {
      Keyboard.setEnabled(false)
      window.Keyboard = null
    }
    document
      .querySelector('.main-button.keyboard')
      .classList[keyboardEnabled ? 'add' : 'remove']('active')
    FileLoader('keyboard-shortcuts.css', !keyboardEnabled)
    FileLoader('keyboard.js', !keyboardEnabled)
    if (keyboardEnabled) {
      localStorage.setItem('hotkeys', true)
    } else {
      delete localStorage['hotkeys']
    }
  }

  function updateFullscreen() {
    document
      .querySelector('.main-button.resize')
      .classList[fullscreen ? 'add' : 'remove']('active')
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

  $(document).ready(function() {
    setTheme(localStorage.getItem('theme') || 'white')
    fullscreen = !!localStorage.getItem('fullscreen')
    updateFullscreen()
    keyboardEnabled = !!localStorage.getItem('hotkeys')
    updateHotkeys()
    logger = window.logger = new WebLogger(document.getElementById('task-logs'))
    axios.get('/info').then(function(response) {
      var appName = response.data.appName
      if (appName) {
        $('title').text(appName + ' | fb')
        var headerTitle = $('header > .title')
        headerTitle
          .text(appName)
          .on('mouseover', function() {
            axios.get('/project-version').then(function(response) {
              if (response.data) {
                headerTitle.html(
                  appName + createSpan('project-version', response.data)
                )
              }
            })
          })
          .on('mouseleave', function() {
            headerTitle.text(appName)
          })
      } // getProjectVersion

      taskList = window.taskList = new TaskList(
        document.getElementById('tasks'),
        response.data.commands
      )
      new WebSocket('ws://' + location.host).onmessage = function(message) {
        var data = JSON.parse(message.data)
        if (data.name) {
          var command = taskList.updateTask(data.name, data.isRun)
          if (data.log) {
            if (command.isActive) {
              logger.push(data.log)
              if (watchTaskLogsScrollTop) logger.scrollTo('bottom')
            }
          }
        }
      }
    })
  })

  return {
    showTaskList: showTaskList,
    runAllTasks: runAllTasks,
    stopAllTasks: stopAllTasks,
    triggerScrollWatcher: triggerScrollWatcher,
    handleClickTab: handleClickTab,
    enableEnvsForm: enableEnvsForm,
    updateEnvs: updateEnvs,
    cancelEnvs: cancelEnvs,
    clearLogs: clearLogs,
    setTheme: setTheme,
    openTask: openTask,
    runTask: runTask,
    stopTask: stopTask,
    toggleKeyboard: toggleKeyboard,
    toggleResize: toggleResize,
  }
})()
