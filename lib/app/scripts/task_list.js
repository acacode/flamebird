/* global $, axios, _ , FileLoader, WebLogger, createDiv, createButton, openTask, funcToStr, TaskList, createSpan */

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

var TaskList = (function() {// eslint-disable-line
  var element
  var taskList = {
    npm: [],
    procfile: [],
  }
  var activeTab
  var activeTask = {
    npm: null,
    procfile: null,
  }

  function updateTaskList() {
    taskList[activeTab].forEach(function(taskData, index) {
      var task = document.createElement('div')
      task.classList.add(
        'task',
        'task-num-' + (index + 1),
        taskData.isRun && 'running',
        taskData.isStartRunning && 'clicked'
      )
      task.setAttribute('id', taskData.name)
      task.setAttribute('onclick', funcToStr(openTask, taskData.name))
      task.setAttribute('char-code', taskCharCodes[index])
      task.innerHTML =
        '<i class="fas fa-cog"></i>' +
        createSpan('task-name', taskData.name) +
        createButton('run-task', 'play', funcToStr(runTask, taskData.name)) +
        createButton('stop-task', 'stop', funcToStr(stopTask, taskData.name))
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
    return _.find(taskList[activeTab], function(c) {
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

    taskButton.classList[isStopping ? 'add' : 'remove']('stopping')
    taskButton.classList[isRun ? 'add' : 'remove']('running')
    taskButton.classList[isStartRunning ? 'add' : 'remove']('clicked')
    return task
  }

  function runTask() {}
  function stopTask() {}

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
          return task.isRun || task.isStartRunning
        })
      : taskList[activeTab]
  }

  return function(el, tasks) {
    element = el
    taskList = _.reduce(
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
    activeTask.npm = taskList.npm[0].name
    activeTask.procfile = taskList.procfile[0].name
    activeTab = taskList.procfile.length ? 'procfile' : 'npm'
    updateTaskList()
    return {
      updateTaskList: updateTaskList,
      runTask: runTask,
      stopTask: stopTask,
      clear: clear,
      changeTab: changeTab,
      getTask: getTask,
      updateTask: updateTask,
      setActive: setActive,
      getActive: getActive,
      getAllFromActiveTab: getAllFromActiveTab,
    }
  }
})()
