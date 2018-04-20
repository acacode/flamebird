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
          .addClass('task')
          .attr('id', taskData.name)
          .html('<span>' + taskData.name + '</span>')
          .on('click', openTask.bind(taskData))
        task.append(runTaskButton)
        task.append(stopTaskButton)
        tasks.append(task)
      })
      $('#' + response.data[0].name).trigger('click')
    }
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
      if (document.body.classList.contains('active_' + data.name)) {
        $('#task-logs').append(createTaskLog(data.log))
      }
    }
  }
})

function createTaskLog(log) {
  return '<div>' + ansiUp.ansi_to_html(log) + '</div>'
}

function openTask(event) {
  event.preventDefault()
  document.body.className = ''
  document.body.classList.add('active_' + this.name)
  $('#task-logs').html(this.logs.map(createTaskLog).join(''))
  // axios.post('/run', this)
}
function runTask(event) {
  event.preventDefault()
  axios.post('/run', this)
}
function stopTask(event) {
  event.preventDefault()
  axios.post('/stop', this)
}
