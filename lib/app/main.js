/* global $, axios, _ , AnsiUp , createDiv, createButton, funcToStr, createSpan */
var ansiUp = new AnsiUp()
ansiUp.use_classes = true
ansiUp.escape_for_html = false
var watchTaskLogsScrollTop = true
var commands = []
var taskLogs = null
var tasks
var theme
var activeTab = 'Procfile'
var previousEnvs = null

var taskCharCodes = [
  81,
  87,
  69,
  82,
  84,
  89,
  85,
  73,
  79,
  80,
  219,
  221,
  65,
  83,
  68,
  70,
  71,
  72,
  74,
  75,
  76,
  186,
  222,
  90,
  88,
  67,
  86,
  66,
  78,
  77,
  188,
  190,
  191,
]

function displayInfo(isNPM) {
  if (commands.length) {
    tasks.html('')
    var filteredCommands = filterCommands(isNPM)
    if (filteredCommands.length) {
      filteredCommands.forEach(function(taskData, index) {
        var task = createDiv(
          'task ' +
            ('task-num-' + (index + 1)) +
            (taskData.isRun ? ' running' : '') +
            (taskData.isStartRunning ? ' clicked' : ''),
          createSpan('task-name', taskData.name),
          'cog',
          taskData.name,
          openTask.bind(null, taskData.name),
          true
        )
        task.attr('char-code', taskCharCodes[index])
        task.append(
          createButton('run-task', 'play', funcToStr(runTask, taskData.name))
        )
        task.append(
          createButton('stop-task', 'stop', funcToStr(stopTask, taskData.name))
        )
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

function showTaskList() { // eslint-disable-line
  document.body.classList[
    document.body.classList.contains('task-list-showed') ? 'remove' : 'add'
  ]('task-list-showed')
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

function fixLog(log) {
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

function openTask(name) {  // eslint-disable-line
  var command = findCommandByName(name)
  setActiveCommand(command)
  var logs = command.logs.map(createTaskLog)
  if (_.keys(command.envs).length) {
    logs.unshift(
      createDiv(
        'envs-log',
        _.map(command.envs, function(value, key) {
          return (
            createSpan('ansi-bright-magenta-fg', key) +
            '=' +
            createEnvsInput(key, value)
          )
        }).join(', ') +
          createButton('logs-button', 'edit', 'enableEnvsForm()') +
          createButton('logs-button cancel', 'times', 'cancelEnvs()') +
          createButton('logs-button apply', 'check', 'updateEnvs()')
      )
    )
  }
  logs.unshift(createDiv('task-data', createSpan('', command.task)))
  $('#task-logs').html(logs.join(''))
  scrollToBottom()
}
function runTask(name) {// eslint-disable-line
  var command = findCommandByName(name)
  if (!command.isStartRunning && !command.isRun) {
    setActiveCommand(command, true)
    axios.post('/run/' + command.name)
  }
}
function stopTask(name) {// eslint-disable-line
  var command = findCommandByName(name)
  if (!command.isStartRunning && command.isRun) {
    var task = $('#' + command.name)
    task.addClass('stopping')
    axios.post('/stop/' + command.name)
  }
}

function setTheme(_theme) {
  if (_theme !== theme) {
    localStorage.setItem('theme', _theme)
    var body = $('body')
    body.removeClass(theme + '-theme')
    body.addClass(_theme + '-theme')
    theme = _theme
  }
}

$(document).ready(function() {
  setTheme(localStorage.getItem('theme') || 'white')
  taskLogs = $('#task-logs')
  tasks = $('#tasks')
  $(window).keydown(function(event) {
    if (event.ctrlKey) {
      if (event.keyCode === 82) {
        var command = findCommandByName(getActiveCommand())
        if (!command.isStartRunning && !command.isRun) {
          runTask(command.name)
        }
        if (!command.isStartRunning && command.isRun) {
          stopTask(command.name)
        }
        event.preventDefault()
      }
    } else {
      if (event.keyCode === 9) {
        handleClickTab(
          $('#packageJson').hasClass('active') ? 'Procfile' : 'packageJson'
        )
      } else {
        var task = $('.task[char-code="' + event.keyCode + '"]')
        if (task.length === 1) {
          task.trigger('click')
        }
      }
    }
  })
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
