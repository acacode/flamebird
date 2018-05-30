/* global $,  _ , createButton, global, Keyboard, createSpan */

window.TaskList = (function() {// eslint-disable-line
  var element
  var taskList = {
    npm: [],
    procfile: [],
  }
  var activeTab = 'procfile'
  var activeTask = {
    npm: null,
    procfile: null,
  }

  function updateTaskList() {
    _.forEach(taskList[activeTab], function(taskData, index) {
      var task = document.createElement('div')
      task.classList.add(
        'task',
        'task-num-' + (index + 1),
        taskData.isRun && 'running',
        taskData.isStartRunning && 'clicked'
      )
      task.setAttribute('id', taskData.name)
      task.setAttribute('onclick', "global.openTask('" + taskData.name + "')")
      if (window.Keyboard) {
        Keyboard.connect(task, index)
      }
      task.innerHTML =
        '<i class="fas fa-cog"></i>' +
        createSpan('task-name', taskData.name) +
        createButton(
          'run-task',
          'play',
          "global.runTask('" + taskData.name + "')"
        ) +
        createButton(
          'stop-task',
          'stop',
          "global.stopTask('" + taskData.name + "')"
        )
      element.appendChild(task)
    })
    setTimeout(function() {
      $('#' + activeTask[activeTab]).trigger('click')
    }, 0)
  }
  function changeTab(newTab) {
    document.getElementById(activeTab).classList.remove('active')
    activeTab = newTab
    document.getElementById(activeTab).classList.add('active')
    clear()
    updateTaskList()
  }
  function getTask(name) {
    return _.find(_.concat.apply(null, _.values(taskList)), function(c) {
      return c.name === name
    })
  }
  function updateTask(name, isRun, isActive, isStartRunning, isStopping) {
    var task = getTask(name)
    var taskButton = document.getElementById(name)
    task.isRun = isRun
    task.isStartRunning = !!isStartRunning
    task.isStopping = !!isStopping

    if (isActive) {
      task.isActive = true
      var previousActiveTask = document.querySelector('.task.active')
      if (previousActiveTask) {
        var id = previousActiveTask.getAttribute('id')
        if (id !== name) {
          getTask(previousActiveTask.getAttribute('id')).isActive = false
          previousActiveTask.classList.remove('active')
        }
      }
      taskButton.classList.add('active')
    }
    if (taskButton) {
      taskButton.classList[isStopping ? 'add' : 'remove']('stopping')
      taskButton.classList[isRun ? 'add' : 'remove']('running')
      taskButton.classList[isStartRunning ? 'add' : 'remove']('clicked')
    }
    return task
  }

  function clear() {
    while (element.lastChild) {
      element.removeChild(element.lastChild)
    }
  }
  function setActive(task, isStartRunning, isStopping) {
    activeTask[task.isNPM ? 'npm' : 'procfile'] = task.name
    updateTask(
      task.name,
      task.isRun,
      true,
      isStartRunning === undefined ? task.isStartRunning : isStartRunning,
      isStopping === undefined ? task.isStopping : isStopping
    )
  }

  function getActive() {
    return getTask(activeTask[activeTab])
  }

  function getAllFromActiveTab(isRun) {
    return isRun
      ? _.filter(taskList[activeTab], function(task) {
          return task.isRun
        })
      : taskList[activeTab]
  }

  return function(el, tasks) {
    element = el
    var unsortedTaskList = _.reduce(
      tasks,
      function(newTaskList, task) {
        newTaskList[task.isNPM ? 'npm' : 'procfile'].push(task)
        return newTaskList
      },
      {
        npm: [],
        procfile: [],
      }
    )
    taskList = {
      npm: _.sortBy(unsortedTaskList.npm, 'name', 'asc'),
      procfile: _.sortBy(unsortedTaskList.procfile, 'name', 'asc'),
    }
    if (taskList.npm.length) {
      activeTask.npm = taskList.npm[0].name
    }
    activeTask.procfile = taskList.procfile.length
      ? taskList.procfile[0].name
      : null
    activeTask.npm = taskList.npm.length ? taskList.npm[0].name : null
    activeTab = activeTask.procfile ? 'procfile' : 'npm'
    if (activeTask.procfile) {
      activeTab = 'procfile'
      updateTaskList()
    } else {
      changeTab('npm')
    }
    return {
      updateTaskList: updateTaskList,
      clear: clear,
      changeTab: changeTab,
      getTask: getTask,
      updateTask: updateTask,
      setActive: setActive,
      getActive: getActive,
      getActiveTab: function() {
        return activeTab
      },
      getAllFromActiveTab: getAllFromActiveTab,
    }
  }
})()
