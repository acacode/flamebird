/* global $, axios, _ , AnsiUp */
var ansiUp = new AnsiUp()
ansiUp.use_classes = true
ansiUp.escape_for_html = false
var commands = []
var appName = ''

$(document).ready(function() {
  axios.get('/info').then(function(response) {
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
  })

  $('.main-button.run').on('click', function() {
    axios.post('/run-all')
    // $('#tasks .task').addClass('running')
  })
  $('.main-button.stop').on('click', function() {
    axios.post('/stop-all')
    // $('#tasks .task').removeClass('running')
  })

  var ws = new WebSocket('ws://' + location.host)
  ws.onopen = function() {
    console.log('onopen', arguments)
  }
  ws.onmessage = function(message) {
    var data = JSON.parse(message.data)
    console.log(data)
    if (data.name) {
      var command = _.find(commands, function(c) {
        return c.name === data.name
      })
      var taskButton = $('#' + data.name)
      if (data.log) {
        command.logs.push(data.log)
        if (taskButton.hasClass('active')) {
          $('#task-logs').append(createTaskLog(data.log))
        }
      }
      taskButton[data.isRun ? 'addClass' : 'removeClass']('running')
    }
  }
})

function createTaskLog(log) {
  var ansiParsedLog = ansiUp.ansi_to_html(
    log.replace(/[\n\r]/g, '<br>').replace(/ /g, '&nbsp;')
  )
  if (
    log.includes('Exited Successfully') ||
    log.includes('Exited with exit code ')
  ) {
    return '<span class="ended">' + ansiParsedLog + '</span><br><br>'
  }
  return ansiParsedLog
}

function setActiveCommand(command) {
  $('.task.active').removeClass('active')
  $('.task-data > span').text(command.task)
  $('#' + command.name).addClass('active' + (command.isRun ? ' running' : ''))
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
  // axios.post('/run', this)
}
function runTask(event) {
  event.preventDefault()
  setActiveCommand(this)
  $('.task-data > span').text(this.task)
  axios.post('/run/' + this.name)
}
function stopTask(event) {
  event.preventDefault()
  // $('#' + this.name).removeClass('running')
  axios.post('/stop/' + this.name)
}
