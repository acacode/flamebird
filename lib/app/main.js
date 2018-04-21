/* global $, axios, _ , AnsiUp */
var ansiUp = new AnsiUp()
var commands = []

$(document).ready(function() {
  axios.get('/commands').then(function(response) {
    if (response.data.length) {
      commands = response.data
      var tasks = $('#tasks')
      response.data.forEach(function(taskData) {
        var runTaskButton = $('<button class="run-task">run</button>').on(
          'click',
          runTask.bind(taskData)
        )
        var stopTaskButton = $('<button class="stop-task">stop</button>').on(
          'click',
          stopTask.bind(taskData)
        )
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
      $('#' + response.data[0].name).trigger('click')
    }
  })

  $('.main-button.run').on('click', function() {
    axios.post('/run-all')
    $('#tasks .task').addClass('running')
  })
  $('.main-button.stop').on('click', function() {
    axios.post('/stop-all')
    $('#tasks .task').removeClass('running')
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
      command.logs.push(data.log)
      if ($('#' + data.name).hasClass('active')) {
        $('#task-logs').append(createTaskLog(data.log))
      }
    }
  }
})

function createTaskLog(log) {
  return '<div>' + ansiUp.ansi_to_html(log) + '</div>'
}

function setActiveCommand(command, isRun) {
  $('.task.active').removeClass('active')
  $('.task-data > span').text(command.task)
  $('#' + command.name).addClass('active' + (isRun ? ' running' : ''))
}

function openTask(event) {
  event.preventDefault()
  setActiveCommand(this)
  $('#task-logs').html(this.logs.map(createTaskLog).join(''))
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
  $('#' + this.name).removeClass('running')
  axios.post('/stop/' + this.name)
}
