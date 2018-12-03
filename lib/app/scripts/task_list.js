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
      { isRun, isLaunching, isActive, name, id },
      index
    ) {
      const task = document.createElement('div')
      task.classList.add(
        'task',
        'task-num-' + (index + 1),
        isRun && 'running',
        isLaunching && 'clicked',
        isActive && 'active'
      )
      task.setAttribute('id', id)
      task.setAttribute('onclick', `global.openTask('${id}')`)
      if (window.HotKeys) {
        HotKeys.connect(task, index)
      }
      task.innerHTML =
        '<i class="fas fa-cog"></i>' +
        createSpan('task-name', name) +
        createButton('run-task', 'play', `global.runTask('${id}')`) +
        createButton('stop-task', 'stop', `global.stopTask('${id}')`)
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
  const getTask = id => _.find(_.concat.apply(null, _.values(taskList)), { id })

  function updateTask(id, isRun, isActive, isLaunching, isStopping) {
    const task = getTask(id)
    const taskElem = document.getElementById(task.id)
    task.isRun = isRun
    task.isLaunching = !!isLaunching
    task.isStopping = !!isStopping

    if (isActive) {
      task.isActive = true
      var prevActiveTask = document.querySelector('.task.active')
      if (prevActiveTask) {
        var prevTask = prevActiveTask.getAttribute('id')
        if (prevTask !== task.id) {
          getTask(prevTask).isActive = false
          removeClass(prevActiveTask, 'active')
        }
      }
      addClass(taskElem, 'active')
    }
    toggleClass(taskElem, 'stopping', isStopping)
    toggleClass(taskElem, 'running', isRun)
    toggleClass(taskElem, 'clicked', isLaunching)
    return task
  }

  function clear() {
    while (element.lastChild) element.removeChild(element.lastChild)
  }

  function setActive(task, isLaunching, isStopping) {
    activeTask[task.isNPM ? 'npm' : 'procfile'] = task.id
    updateTask(
      task.id,
      task.isRun,
      true,
      isLaunching === undefined ? task.isLaunching : isLaunching,
      isStopping === undefined ? task.isStopping : isStopping
    )
  }

  function sortTaskList(taskList) {
    return _.sortBy(taskList, 'name', 'asc')
  }

  return function(el, tasks) {
    element = el
    wrapper = document.querySelector('.wrapper')
    tabElements.npm = document.getElementById('npm')
    tabElements.procfile = document.getElementById('procfile')
    var unsortedTaskList = _.reduce(
      tasks,
      (taskList, task) => {
        var taskType = task.isNPM ? 'npm' : 'procfile'
        taskList[taskType].push(task)
        return taskList
      },
      {
        npm: [],
        procfile: [],
      }
    )
    taskList = {
      npm: sortTaskList(unsortedTaskList.npm),
      procfile: sortTaskList(unsortedTaskList.procfile),
    }
    activeTask.procfile = taskList.procfile.length
      ? taskList.procfile[0].id
      : null
    activeTask.npm = taskList.npm.length ? taskList.npm[0].id : null
    if (activeTask.procfile) {
      activeTab = 'procfile'
      updateTaskList()
    } else {
      changeTab('npm')
      tabElements.procfile.remove()
      delete tabElements.procfile
    }
    let notifyTaskTimers = {}
    function setTaskUpdated(taskId, isUpdated, options) {
      if (!options) options = {}
      $('#' + taskId)[isUpdated ? 'addClass' : 'removeClass']('updated')
      if (Notification && options.notify && isUpdated) {
        if (notifyTaskTimers[taskId]) {
          clearTimeout(notifyTaskTimers[taskId])
          notifyTaskTimers[taskId] = null
        }
        notifyTaskTimers[taskId] = setTimeout(() => {
          const task = getTask(taskId)
          if (Notification.permission !== 'granted')
            Notification.requestPermission()
          else {
            var notification = new Notification(
              '"' + task.name + '" has been updated',
              {
                icon: '/logo2_small.png',
                body:
                  'project: ' +
                  options.projectName +
                  '\r\ntaskfile: ' +
                  (task.isNPM ? 'package.json' : 'Procfile') +
                  '\r\nlatest message: ' +
                  options.log,
              }
            )

            notification.onclick = function() {
              window.open(location.origin)
            }
          }
        }, 360)
      }
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
      setUpdated: setTaskUpdated,
      getAllFromActiveTab: isRun =>
        isRun
          ? _.filter(taskList[activeTab], task => task.isRun)
          : taskList[activeTab],
    }
  }
})()
