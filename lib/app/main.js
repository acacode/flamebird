/* global $, axios, _ , FileLoader, WebLogger, createDiv, createButton, funcToStr, TaskList, createSpan */
var watchTaskLogsScrollTop = true
var commands = []
var theme
var logger
var taskList
var openedTask
var activeTab = 'Procfile'
var previousEnvs = null

function showTaskList() { // eslint-disable-line
  document.body.classList[
    document.body.classList.contains('task-list-showed') ? 'remove' : 'add'
  ]('task-list-showed')
}

function runAllTasks(e) { // eslint-disable-line
  _.forEach(taskList.getAllFromActiveTab(), function(t) {
    taskList.updateTask(t.name, t.isRun, t.isActive, true, false)
    axios.post('/run/' + t.name)
  })
}

function stopAllTasks(e) { // eslint-disable-line
  _.forEach(taskList.getAllFromActiveTab(true), function(t) {
    taskList.updateTask(t.name, t.isRun, t.isActive, false, true)
    axios.post('/stop/' + t.name)
  })
}

function clearLogs(activeTask) { // eslint-disable-line
  if (!activeTask) {
    activeTask = taskList.getActive()
  }
  axios.post('/clear-logs/' + activeTask.name)
  activeTask.logs = []
  logger.clear()
  // $('#' + activeCommand).trigger('click')
}
function triggerScrollWatcher(e) { // eslint-disable-line
  logger.scrollTo('bottom', true)
  watchTaskLogsScrollTop = !watchTaskLogsScrollTop
  $('.logs-button.autoscroll').toggleClass('active', watchTaskLogsScrollTop)
}

function handleClickTab(tab) { // eslint-disable-line
  if (tab !== activeTab) {
    taskList.changeTab(tab)
    // displayInfo(tab !== 'Procfile')
  }
}

function enableEnvsForm(){// eslint-disable-line
  $('.envs-log').addClass('active')
  previousEnvs = _.clone(taskList.getActive().envs)
}

function updateEnvs() { // eslint-disable-line
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
function cancelEnvs(){// eslint-disable-line
  $('.envs-log').removeClass('active')
  _.each($('.envs-log > input'), function(el) {
    var input = $(el)
    input.val(previousEnvs[input.attr('key')])
  })
  taskList.getActive().envs = _.clone(previousEnvs)
  previousEnvs = null
}

function openTask(name) {  // eslint-disable-line
  if (name !== openedTask) {
    var task = taskList.getTask(name)
    taskList.setActive(task)
    openedTask = name
    // setActiveCommand(task)
    logger.clear(true)
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
}
function runTask(name) {// eslint-disable-line
  this.event.stopPropagation()
  var task = taskList.getTask(name)
  if (!task.isStartRunning && !task.isRun) {
    taskList.setActive(task, true)
    axios.post('/run/' + task.name)
  }
}
function stopTask(name) {// eslint-disable-line
  this.event.stopPropagation()
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
    $('.theme.' + theme).removeClass('active')
    $('.theme.' + newTheme).addClass('active')
    if (newTheme !== 'white') {
      FileLoader(newTheme + '-theme.css')
    }
    theme = newTheme
  }
}
$(document).ready(function() {
  setTheme(localStorage.getItem('theme') || 'white')
  logger = new WebLogger(document.getElementById('task-logs'))
  // tasks = $('#tasks')
  $(window).keydown(function(event) {
    if (event.target.tagName !== 'INPUT') {
      if (event.ctrlKey) {
        if (event.keyCode === 82) {
          var task = taskList.getActive()
          if (!task.isStartRunning && !task.isRun) {
            runTask(task.name)
          }
          if (!task.isStartRunning && task.isRun) {
            stopTask(task.name)
          }
          event.preventDefault()
        }
      } else {
        if (event.keyCode === 9) {
          handleClickTab(
            $('#packageJson').hasClass('active') ? 'Procfile' : 'packageJson'
          )
        } else {
          var taskButton = $('.task[char-code="' + event.keyCode + '"]')
          if (taskButton.length === 1) {
            taskButton.trigger('click')
          }
        }
      }
    }
  })
  // taskLogs.on('scroll', function() {
  //   if (this.scrollTop > 70) {
  //     this.classList.add('flying')
  //   } else {
  //     this.classList.remove('flying')
  //   }
  // })
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

    taskList = new TaskList(
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
