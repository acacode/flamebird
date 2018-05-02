/* global $, axios, _ , AnsiUp */
var ansiUp = new AnsiUp()
ansiUp.use_classes = true
ansiUp.escape_for_html = false
var watchTaskLogsScrollTop = true
var commands = []
var taskLogs = null

function displayInfo(isNPM) {
  if (commands.length) {
    var tasks = $('#tasks')
    tasks.html('')
    var filteredCommands = filterCommands(isNPM)
    if (filteredCommands.length) {
      filteredCommands.forEach(function(taskData) {
        var runTaskButton = $(
          '<button class="run-task"><i class="fas fa-play"></i></button>'
        ).on('click', runTask.bind(taskData))
        var stopTaskButton = $(
          '<button class="stop-task"><i class="fas fa-stop"></i></button>'
        ).on('click', stopTask.bind(taskData))
        var task = $('<div></div>')
          .addClass(
            'task' +
              (taskData.isRun ? ' running' : '') +
              (taskData.isStartRunning ? ' clicked' : '')
          )
          .attr('id', taskData.name)
          .html(
            '<i class="fas fa-cog"></i>' + '<span>' + taskData.name + '</span>'
          )
          .on('click', openTask.bind(taskData))
        task.append(runTaskButton)
        task.append(stopTaskButton)
        tasks.append(task)
      })
      $(
        '#' +
          (isNPM
            ? activeNPMCommand || filteredCommands[0].name
            : activeProcfileCommand || filteredCommands[0].name)
      ).trigger('click')
    }
  }
}

function runAllTasks(e) { // eslint-disable-line
  var filteredCommands = filterCommands(
    $('.tab#packageJson').hasClass('active'),
    false
  )
  if (filteredCommands.length) {
    _.forEach(filteredCommands, function(c) {
      $('#' + c.name).addClass('clicked')
      axios.post('/run/' + c.name)
    })
  }
}
function stopAllTasks(e) { // eslint-disable-line
  var filteredCommands = filterCommands(
    $('.tab#packageJson').hasClass('active'),
    true
  )
  if (filteredCommands.length) {
    _.forEach(filteredCommands, function(c) {
      $('#' + c.name).addClass('stopping')
      axios.post('/stop/' + c.name)
    })
  }
}

function getActiveCommand() {
  return $('#packageJson').hasClass('active')
    ? activeNPMCommand
    : activeProcfileCommand
}

function clearLogs(activeCommand) { // eslint-disable-line
  activeCommand = activeCommand || getActiveCommand()
  axios.post('/clear-logs/' + activeCommand)
  findCommandByName(activeCommand).logs = []
  $('#' + activeCommand).trigger('click')
}
function scrollToTop() { // eslint-disable-line
  taskLogs.animate({ scrollTop: 0 }, '500')
}
function triggerScrollWatcher(e) { // eslint-disable-line
  scrollToBottom(true)
  watchTaskLogsScrollTop = !watchTaskLogsScrollTop
  $('.logs-button.autoscroll').toggleClass('active', watchTaskLogsScrollTop)
}
function findCommandByName(name, isNPM) {
  return _.find(commands, function(c) {
    return c.name === name && (isNPM !== undefined ? c.isNPM === !!isNPM : true)
  })
}

function createSpan(classes, text) {
  return '<span class="' + (classes || '') + '">' + text + '</span>'
}

function fixLog(log) {
  if (/^[.]{1,}$/.test(log)) {
    return createSpan('ansi-bright-green-fg mocha-test', log)
  }
  if (
    /^(([.]{0,})(<br>&nbsp;&nbsp;)([.]{1,}))|(([.]{1,})(<br>&nbsp;&nbsp;)([.]{0,}))$/g.test(
      log
    )
  ) {
    return log.replace('.', createSpan('ansi-bright-green-fg mocha-test', '.'))
  }
  if (/^[!]{1,}$/.test(log)) {
    return createSpan('ansi-bright-red-fg mocha-test', log)
  }
  if (
    /^(([!]{0,})(<br>&nbsp;&nbsp;)([!]{1,}))|(([!]{1,})(<br>&nbsp;&nbsp;)([!]{0,}))$/g.test(
      log
    )
  ) {
    return log.replace('!', createSpan('ansi-bright-red-fg mocha-test', '!'))
  }
  if (log.includes('Warning:')) {
    return createSpan('ansi-yellow-fg', log) // '<span class="ansi-yellow-fg">'+log+'</span>'
  }
  if (log.includes('Exited&nbsp;Successfully')) {
    return createSpan('ended ok', log) + '<br><br>'
  }
  if (log.includes('Exited&nbsp;with&nbsp;exit&nbsp;code&nbsp;')) {
    return createSpan('ended', log) + '<br><br>'
  }
  // log = log.replace(/(npm&nbsp;ERR!&nbsp;)/g, function(conc) {
  //   return 'npm&nbsp;' + createSpan('ansi-bright-red-fg', 'ERR!')
  // })
  return log
    .replace(/(:\d{1,}:\d{1,})/g, function(conc) {
      return createSpan('tussock', conc)
    })
    .replace(/(&nbsp;ERR!)/g, function(conc) {
      return '&nbsp;' + createSpan('ansi-bright-red-fg', 'ERR!')
    })
    .replace(/(\[(emitted|built)\])/g, function(conc) {
      return createSpan('ansi-green-fg bold', conc)
    })
}

function updateCommandData(name, log, isRun, isNPM) {
  var command = findCommandByName(name, isNPM)
  var taskButton = $('#' + name)
  command.isRun = isRun
  if (log) {
    command.logs.push(log)
    if (taskButton.hasClass('active')) {
      taskLogs.append(createTaskLog(log))
      if (watchTaskLogsScrollTop) scrollToBottom()
    }
  }
  command.isStartRunning = false
  taskButton.removeClass('clicked stopping')
  taskButton.toggleClass('running', isRun)
}

function filterCommands(isNPM, isRun) {
  return _.filter(commands, function(c) {
    if (isNPM !== undefined && c.isNPM !== !!isNPM) {
      return false
    }
    if (isRun !== undefined && c.isRun !== !!isRun) {
      return false
    }
    return true
  })
}

$(document).ready(function() {
  taskLogs = $('#task-logs')
  taskLogs.on('scroll', function() {
    if (this.scrollTop > 70) {
      this.classList.add('flying')
    } else {
      this.classList.remove('flying')
    }
  })
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
    commands = response.data.commands
    if (filterCommands(false).length) {
      displayInfo(false)
    } else {
      handleClickTab('packageJson')
    }
  })

  new WebSocket('ws://' + location.host).onmessage = function(message) {
    var data = JSON.parse(message.data)
    if (data.name) {
      updateCommandData(data.name, data.log, data.isRun, data.isNPM)
    }
  }
})

var activeTab = 'Procfile'
function handleClickTab(tab) { // eslint-disable-line
  if (tab !== activeTab) {
    $('#' + activeTab).removeClass('active')
    activeTab = tab
    $('#' + activeTab).addClass('active')
    displayInfo(tab !== 'Procfile')
  }
}

function scrollToBottom(animate) {
  var taskLogsEl = taskLogs.get(0)
  if (animate) {
    taskLogs.animate(
      {
        scrollTop: taskLogsEl.scrollHeight,
      },
      '1500'
    )
  } else {
    taskLogsEl.scrollTop = taskLogsEl.scrollHeight
  }
}

function createTaskLog(log) {
  var ansiParsedLog = ansiUp.ansi_to_html(
    log.replace(/[\n\r]/g, '<br>').replace(/ /g, '&nbsp;')
  )
  return fixLog(ansiParsedLog)
}

var activeNPMCommand = null
var activeProcfileCommand = null

function setActiveCommand(command, isStartRunning) {
  if (command.isNPM) {
    activeNPMCommand = command.name
  } else {
    activeProcfileCommand = command.name
  }
  $('.task.active').removeClass('active')
  if (isStartRunning) {
    command.isStartRunning = true
  }
  $('#' + command.name).addClass(
    'active' +
      (command.isRun ? ' running' : '') +
      (isStartRunning ? ' clicked' : '')
  )
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

function createEnvsLog(envs) {
  return (
    '<div class="envs-log">' +
    _.map(envs, function(value, key) {
      return (
        createSpan('ansi-bright-magenta-fg', key) +
        '=' +
        createEnvsInput(key, value)
      )
    }).join(', ') +
    '<button class="logs-button" onclick="enableEnvsForm()"><i class="fas fa-edit"></i></button><button class="logs-button cancel" onclick="cancelEnvs()"><i class="fas fa-times"></i></button><button class="logs-button apply" onclick="updateEnvs()"><i class="fas fa-check"></i></button></div>'
  )
}

var previousEnvs = null

function enableEnvsForm(){// eslint-disable-line
  $('.envs-log').addClass('active')
  var activeCommand = getActiveCommand()
  previousEnvs = _.clone(findCommandByName(activeCommand).envs)
}

function updateEnvs() { // eslint-disable-line
  $('.envs-log').removeClass('active')
  var activeCommand = getActiveCommand()
  _.each($('.envs-log > input'), function(el) {
    var input = $(el)
    previousEnvs[input.attr('key')] = input.val()
  })
  findCommandByName(activeCommand).envs = _.clone(previousEnvs)
  clearLogs(activeCommand)
  axios.post('/update-envs', {
    name: activeCommand,
    envs: _.clone(previousEnvs),
  })
  previousEnvs = null
}
function cancelEnvs(){// eslint-disable-line
  $('.envs-log').removeClass('active')
  var activeCommand = getActiveCommand()
  _.each($('.envs-log > input'), function(el) {
    var input = $(el)
    input.val(previousEnvs[input.attr('key')])
  })
  findCommandByName(activeCommand).envs = _.clone(previousEnvs)
  previousEnvs = null
}

function openTask(event) {
  event.preventDefault()
  setActiveCommand(this)
  var logs = this.logs.map(createTaskLog)
  if (_.keys(this.envs).length) {
    logs.unshift(createEnvsLog(this.envs))
  }
  logs.unshift('<div class="task-data"><span>' + this.task + '</span></div>')
  $('#task-logs').html(logs.join(''))
  scrollToBottom()
}
function runTask(event) {
  event.preventDefault()
  setActiveCommand(this, true)
  axios.post('/run/' + this.name)
}
function stopTask(event) {
  event.preventDefault()
  $('#' + this.name).removeClass('stopping')
  axios.post('/stop/' + this.name)
}
