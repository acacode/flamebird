/* global $, taskList, stopTask, runTask, _,  handleClickTab  */

var Keyboard = (function() { //eslint-disable-line
  var isEnabled = false
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

  function onKeydown(event) {
    if (event.target.tagName !== 'INPUT') {
      if (event.ctrlKey) {
        if (event.keyCode === 82) {
          var task = taskList.getActive()
          if (!task.isStartRunning) {
            if (task.isRun) {
              stopTask(task.name)
            } else {
              runTask(task.name)
            }
          }
          event.preventDefault()
        }
      } else {
        if (event.keyCode === 9) {
          handleClickTab(taskList.getActiveTab() === 'npm' ? 'procfile' : 'npm')
        } else {
          $('.task[char-code="' + event.keyCode + '"]').trigger('click')
        }
      }
    }
  }

  function setEnabled(enabled) {
    isEnabled = enabled
    $(window)[isEnabled ? 'on' : 'off']('keydown', onKeydown)
  }

  function connect(element, indexKeycode) {
    element.setAttribute('char-code', taskCharCodes[indexKeycode])
  }

  var currentTasks = document.querySelectorAll('.task')
  _.forEach(currentTasks, function(task, index) {
    connect(task, index)
  })

  setEnabled(true)

  return {
    setEnabled: setEnabled,
    isEnabled: function() {
      return isEnabled
    },
    connect: connect,
  }
})()
