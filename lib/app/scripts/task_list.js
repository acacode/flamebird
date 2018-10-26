/* global $,  _ , createButton, global, HotKeys, createSpan, toggleClass, removeClass, addClass */

window.TaskList = (function() {// eslint-disable-line
  var element
  var taskList = {
    npm: [],
    procfile: [],
  }
  var wrapper
  var activeTab = 'procfile'
  var tabElements = {
    npm: null,
    procfile: null,
  }
  var activeTask = {
    npm: null,
    procfile: null,
  }

  function updateTaskList() {
    _.forEach(taskList[activeTab], function(
      { isRun, isStartRunning, isActive, name },
      index
    ) {
      const task = document.createElement('div')
      task.classList.add(
        'task',
        'task-num-' + (index + 1),
        isRun && 'running',
        isStartRunning && 'clicked',
        isActive && 'active'
      )
      task.setAttribute('id', name)
      task.setAttribute('onclick', `global.openTask('${name}')`)
      if (window.HotKeys) {
        HotKeys.connect(task, index)
      }
      task.innerHTML =
        '<i class="fas fa-cog"></i>' +
        createSpan('task-name', name) +
        createButton('run-task', 'play', `global.runTask('${name}')`) +
        createButton('stop-task', 'stop', `global.stopTask('${name}')`)
      element.appendChild(task)
    })
    setTimeout(function() {
      if (activeTask[activeTab]) {
        $(`#${activeTask[activeTab]}`).trigger('click')
      } else {
        global.getLogger().clear()
      }
    }, 0)
  }
  function changeTab(newTab) {
    if (tabElements[newTab]) {
      tabElements[activeTab].classList.remove('active')
      activeTab = newTab
      tabElements[activeTab].classList.add('active')
      wrapper.className = `wrapper active-tab-${activeTab}`
      clear()
      updateTaskList()
    }
  }
  const getTask = name =>
    _.find(_.concat.apply(null, _.values(taskList)), { name })

  function updateTask(name, isRun, isActive, isStartRunning, isStopping) {
    const task = getTask(name)
    const taskElem = document.getElementById(name)
    task.isRun = isRun
    task.isStartRunning = !!isStartRunning
    task.isStopping = !!isStopping

    if (isActive) {
      task.isActive = true
      var prevActiveTask = document.querySelector('.task.active')
      if (prevActiveTask) {
        var prevTaskName = prevActiveTask.getAttribute('id')
        if (prevTaskName !== name) {
          getTask(prevTaskName).isActive = false
          removeClass(prevActiveTask, 'active')
        }
      }
      addClass(taskElem, 'active')
    }
    toggleClass(taskElem, 'stopping', isStopping)
    toggleClass(taskElem, 'running', isRun)
    toggleClass(taskElem, 'clicked', isStartRunning)
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

  return function(el, tasks) {
    element = el
    wrapper = document.querySelector('.wrapper')
    tabElements.npm = document.getElementById('npm')
    tabElements.procfile = document.getElementById('procfile')
    var unsortedTaskList = _.reduce(
      tasks,
      (newTaskList, task) => {
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
    activeTask.procfile = taskList.procfile.length
      ? taskList.procfile[0].name
      : null
    activeTask.npm = taskList.npm.length ? taskList.npm[0].name : null
    if (activeTask.procfile) {
      activeTab = 'procfile'
      updateTaskList()
    } else {
      changeTab('npm')
      tabElements.procfile.remove()
      delete tabElements.procfile
    }

    return {
      updateTaskList: updateTaskList,
      clear: clear,
      changeTab: changeTab,
      getTask: getTask,
      updateTask: updateTask,
      setActive: setActive,
      getActive: () => getTask(activeTask[activeTab]),
      getActiveTab: function() {
        return activeTab
      },
      getAllFromActiveTab: isRun =>
        isRun
          ? _.filter(taskList[activeTab], task => task.isRun)
          : taskList[activeTab],
    }
  }
})()
