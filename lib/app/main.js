/* global $, axios, _ , AnsiUp */
var ansiUp = new AnsiUp()
ansiUp.use_classes = true
ansiUp.escape_for_html = false
var watchTaskLogsScrollTop = true
var commands = []
var appName = ''
var taskLogs = null

function displayInfo(response) {
  commands = response.data.commands
  appName = response.data.appName
  if (appName) {
    $('title').text(appName + ' | flamebird')
    $('header > span').html('flamebird <span> | ' + appName + '</span>')
  }
  if (commands.length) {
    var tasks = $('#tasks')
    commands.forEach(function(taskData) {
      var runTaskButton = $(
        '<button class="run-task"><i class="fas fa-play"></i></button>'
      ).on('click', runTask.bind(taskData))
      var stopTaskButton = $(
        '<button class="stop-task"><i class="fas fa-stop"></i></button>'
      ).on('click', stopTask.bind(taskData))
      var task = $('<div></div>')
        .addClass('task' + (taskData.isRun ? ' running' : ''))
        .attr('id', taskData.name)
        .html(
          '<i class="fas fa-cog"></i>' + '<span>' + taskData.name + '</span>'
        )
        .on('click', openTask.bind(taskData))
      task.append(runTaskButton)
      task.append(stopTaskButton)
      tasks.append(task)
    })
    $('#' + commands[0].name).trigger('click')
  }
}

function runAllTasks(e) { // eslint-disable-line
  axios.post('/run-all')
}
function stopAllTasks(e) { // eslint-disable-line
  axios.post('/stop-all')
}
function triggerScrollWatcher(e) { // eslint-disable-line
  watchTaskLogsScrollTop = !watchTaskLogsScrollTop
  $('.autoscroll-button').toggleClass('active', watchTaskLogsScrollTop)
  if (watchTaskLogsScrollTop) scrollToBottom(true)
}
function findCommandByName(name) {
  return _.find(commands, function(c) {
    return c.name === name
  })
}

function findIndicesInStr(str, value){
  var indices = [];
  for(var i=0; i<str.length;i++) {
      if (str[i] === value) indices.push(i);
  }
  return indices
}

function fixLog(log){
  if(/^[.]{1,}$/.test(log)){
    return '<span class="ansi-bright-green-fg mocha-test">'+ log + '</span>'
  }
  if(/^(([.]{0,})(<br>&nbsp;&nbsp;)([.]{1,}))|(([.]{1,})(<br>&nbsp;&nbsp;)([.]{0,}))$/g.test(log)){
    return log.replace('.','<span class="ansi-bright-green-fg mocha-test">.</span>')
  }
  if(/^[!]{1,}$/.test(log)){
    return '<span class="ansi-bright-red-fg mocha-test">'+log+'</span>'
  }
  if(/^(([!]{0,})(<br>&nbsp;&nbsp;)([!]{1,}))|(([!]{1,})(<br>&nbsp;&nbsp;)([!]{0,}))$/g.test(log)){
    return log.replace('1','<span class="ansi-bright-green-fg mocha-test">1</span>')
  }
  if(log.includes('Warning:')){
    return '<span class="ansi-yellow-fg">'+log+'</span>'
  }
  if(log.includes('Exited&nbsp;Successfully')){
    return '<span class="ended ok">' + log + '</span><br><br>'
  }
  if (log.includes('Exited&nbsp;with&nbsp;exit&nbsp;code ')) {
    return '<span class="ended">' + log + '</span><br><br>'
  }
  return log
}

function updateCommandData(name, log, isRun) {
  var command = findCommandByName(name)
  var taskButton = $('#' + name)
  if (log) {
    command.logs.push(log)
    if (taskButton.hasClass('active')) {
      taskLogs.append(createTaskLog(log))
      if (watchTaskLogsScrollTop) scrollToBottom()
    }
  }
  taskButton.removeClass('clicked')
  taskButton.toggleClass('running', isRun)
}

$(document).ready(function() {
  taskLogs = $('#task-logs')

  axios.get('/info').then(displayInfo)

  var ws = new WebSocket('ws://' + location.host)
  ws.onopen = function() {
    console.log('onopen', arguments)
    ws.onmessage = function(message) {
      var data = JSON.parse(message.data)
      if (data.name) {
        updateCommandData(data.name, data.log, data.isRun)
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

function setActiveCommand(command, isStartRunning) {
  $('.task.active').removeClass('active')
  $('.task-data > span').text(command.task)
  $('#' + command.name).addClass('active' + (command.isRun ? ' running' : '') + (isStartRunning ? ' clicked' : ''))
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
            '<span class="ansi-bright-magenta-fg">' +
            key +
            '</span>=<span class="ansi-bright-blue-fg">' +
            value +
            '</span>'
          )
        }).join(', ') +
        '</div>'
    )
  }
  $('#task-logs').html(logs.join(''))
  scrollToBottom()
  // axios.post('/run', this)
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
