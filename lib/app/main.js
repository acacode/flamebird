/* global $, axios, _ , AnsiUp */
var ansiUp = new AnsiUp()
ansiUp.use_classes = true
ansiUp.escape_for_html = false
var watchTaskLogsScrollTop = true
var commands = []
var appName = ''
var taskLogs = null

function displayInfo(isNPM) {
  if (appName) {
    $('title').text(appName + ' | flamebird')
    $('header > span').html('flamebird <span> | ' + appName + '</span>')
  }
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
      axios.post('/stop/' + c.name)
    })
  }
}
function clearLogs(e) { // eslint-disable-line
  var activeCommand = $('#packageJson').hasClass('active')
    ? activeNPMCommand
    : activeProcfileCommand
  axios.post('/clear-logs/' + activeCommand)
  findCommandByName(activeCommand).logs = []
  $('#' + activeCommand).trigger('click')
}
function triggerScrollWatcher(e) { // eslint-disable-line
  watchTaskLogsScrollTop = !watchTaskLogsScrollTop
  $('.logs-button.autoscroll').toggleClass('active', watchTaskLogsScrollTop)
  if (watchTaskLogsScrollTop) scrollToBottom(true)
}
function findCommandByName(name, isNPM) {
  return _.find(commands, function(c) {
    return c.name === name && (isNPM !== undefined ? c.isNPM === !!isNPM : true)
  })
}

function createSpan(classes, text) {
  return '<span class="' + (classes || '') + '">' + text + '</span>'
}

function replaceString(str, word, classes) {
  return str.replace(
    new RegExp(word.replace('[', '\\[').replace(']', '\\]'), 'g'),
    function(conc) {
      return createSpan(classes, conc)
    }
  )
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

  log = replaceString(log, '[built]', 'ansi-green-fg bold')
  log = replaceString(log, '[emitted]', 'ansi-green-fg bold')
  return log
}

function updateCommandData(name, log, isRun, isNPM) {
  console.log(isNPM)
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
  taskButton.removeClass('clicked')
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

  axios.get('/info').then(function(response) {
    appName = response.data.appName
    commands = response.data.commands
    if (filterCommands(false).length) {
      displayInfo(false)
    } else {
      $('.tab.active').removeClass('active')
      $('#packageJson').addClass('active')
      displayInfo(true)
    }
    $('.tabs > .tab').on('click', function(e) {
      e.preventDefault()
      if (e.currentTarget.id !== $('.tab.active').get(0).id) {
        $('.tab.active').removeClass('active')
        e.currentTarget.classList.add('active')
        if (e.currentTarget.id === 'Procfile') {
          displayInfo(false)
        } else {
          displayInfo(true)
        }
      }
    })
  })

  var ws = new WebSocket('ws://' + location.host)
  ws.onopen = function() {
    console.log('onopen', arguments)
    ws.onmessage = function(message) {
      var data = JSON.parse(message.data)
      if (data.name) {
        updateCommandData(data.name, data.log, data.isRun, data.isNPM)
      }
    }
  }
})

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
  $('.task-data > span').text(command.task)
  if (isStartRunning) {
    command.isStartRunning = true
  }
  $('#' + command.name).addClass(
    'active' +
      (command.isRun ? ' running' : '') +
      (isStartRunning ? ' clicked' : '')
  )
}

function openTask(event) {
  event.preventDefault()
  setActiveCommand(this)
  var logs = this.logs.map(createTaskLog)
  if (_.keys(this.envs).length) {
    logs.unshift(
      '<div>envs: ' +
        _.map(this.envs, function(value, key) {
          return (
            createSpan('ansi-bright-magenta-fg', key) +
            '=' +
            createSpan('ansi-bright-blue-fg', value)
          )
        }).join(', ') +
        '</div>'
    )
  }
  $('#task-logs').html(logs.join(''))
  scrollToBottom()
}
function runTask(event) {
  event.preventDefault()
  setActiveCommand(this, true)
  $('.task-data > span').text(this.task)
  axios.post('/run/' + this.name)
}
function stopTask(event) {
  event.preventDefault()
  // $('#' + this.name).removeClass('running')
  axios.post('/stop/' + this.name)
}
