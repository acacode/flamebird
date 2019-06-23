window.TaskList = (function() {
  let element
  let taskList = {
    npm: [],
    procfile: [],
  }
  // let tabElements = {
  //   npm: null,
  //   procfile: null,
  // }
  let activeTaskByTab = {
    npm: [],
    procfile: [],
  }
  let notifyTaskTimers = {}

  function init(taskListContainer, tasks) {
    element = taskListContainer
    // tabElements.npm = document.getElementById('npm')
    // tabElements.procfile = document.getElementById('procfile')
    taskList = _.reduce(
      tasks,
      (taskList, task) => {
        taskList[task.type].push(task)
        return taskList
      },
      {
        npm: [],
        procfile: [],
      }
    )
    let activeTab = null
    _.each(Tabs.getAll(), tab => {
      const tasks = getTasksByTab(tab)
      if (tasks) {
        activeTaskByTab[tab.name] = [tasks[0].id]
        if (!activeTab || tab.name === 'procfile') {
          activeTab = tab
          // tasks[0].isActive = true
          // changeTab(tab.name)
        }
      } else {
        if (taskList[tab.name]) delete taskList[tab.name]
        Tabs.removeTab(tab)
        // if (tabElements[tab.name]) {
        //   tabElements[tab.name].remove()
        //   delete tabElements[tab.name]
        // }
      }
    })
    Tabs.listenChanges(onChangeTab)
    if (activeTab) Tabs.setActive(activeTab.name)
  }

  function onChangeTab(name) {
    clear()
    updateTaskList(name)

    setTimeout(function() {
      const { name: currentName } = Tabs.getActive()
      if (name !== currentName) {
        name = currentName
      }
      if (activeTaskByTab[name].length) {
        el(`#${activeTaskByTab[name][0]}`).click()
      } else {
        global.getLogger().clear()
      }
    }, 0)
  }

  function updateTaskList(tabName) {
    _.forEach(taskList[tabName], function(
      { isRun, isLaunching, isActive, name, type, id },
      index
    ) {
      const task = createEl('div', {
        className: [
          'task',
          'task-num-' + (index + 1),
          isRun && 'running',
          isLaunching && 'clicked',
          isActive && 'active',
        ].join(' '),
        id,
        onclick: () => window.global.openTask(id),
      })
      if (window.HotKeys) {
        HotKeys.connect(task, index)
      }
      task.innerHTML =
        '<i class="fas fa-cog"></i>' +
        createSpan('task-name', name) +
        createButton('run-task', 'play', `global.runTask('${id}')`) +
        createButton('stop-task', 'stop', `global.stopTask('${id}')`)
      element.appendChild(task)
      // if (
      //   isActive &&
      //   activeTab.name === type &&
      //   activeTaskByTab[activeTab.name] !== id
      // ) {
      //   // const activeTaskId = id
      //   setTimeout(() => {
      //     // getTask(activeTaskId)
      //     task.click()
      //   }, 0)
      // }
    })
  }

  const getTask = id => _.find(_.concat.apply(null, _.values(taskList)), { id })

  function updateTask(id, isRun, isActive, isLaunching, isStopping) {
    const task = getTask(id)
    const taskElem = document.getElementById(task.id)
    task.isRun = isRun
    task.isLaunching = !!isLaunching
    task.isStopping = !!isStopping
    task.isActive = !!isActive

    if (task.isActive) {
      const prevActiveTask = document.querySelector('.task.active')
      if (prevActiveTask) {
        const prevTaskId = activeTaskByTab[task.type][0]
        if (prevTaskId !== task.id) {
          getTask(prevTaskId).isActive = false
          removeClass(prevActiveTask, 'active')
        }
      }
      activeTaskByTab[task.type] = [task.id]
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
    updateTask(
      task.id,
      task.isRun,
      true,
      isLaunching === undefined ? task.isLaunching : isLaunching,
      isStopping === undefined ? task.isStopping : isStopping
    )
  }

  const getTasksByTab = tab => {
    const tasks = taskList[tab.name]
    return tasks && tasks.length && tasks
  }

  function getAllFromActiveTab(filter) {
    const tasks = getTasksByTab(Tabs.getActive())
    return filter ? _.filter(tasks, filter) : tasks
  }

  const getActive = () => getTask(activeTaskByTab[Tabs.getActive().name][0])

  function setTaskUpdated(taskId, isUpdated, options) {
    const task = getTask(taskId)
    const activeTab = Tabs.getActive()
    if (!options) options = {}
    if (task.type === activeTab.name)
      el(`#${taskId}`).classList[isUpdated ? 'add' : 'remove']('updated')
    if (Notification && options.notify && isUpdated) {
      if (notifyTaskTimers[taskId]) {
        clearTimeout(notifyTaskTimers[taskId])
        notifyTaskTimers[taskId] = null
      }
      notifyTaskTimers[taskId] = setTimeout(() => {
        const task = getTask(taskId)
        if (Notification.permission === 'granted') {
          const notification = new Notification(
            `"${task.name}" has been updated`,
            {
              icon: 'assets/logo2_small.png',
              body:
                `project: ${options.projectName}` +
                `\r\ntaskfile: [${task.type}]` +
                '\r\nlatest message: ' +
                options.log,
            }
          )
          notification.onclick = window.focus
        } else Notification.requestPermission()
      }, 1800)
    }
  }

  return function(taskListContainer, tasks) {
    init(taskListContainer, tasks)
    return {
      clear: clear,
      getTask: getTask,
      updateTask: updateTask,
      setActive: setActive,
      getActive: getActive,
      setUpdated: setTaskUpdated,
      getAllFromActiveTab: getAllFromActiveTab,
    }
  }
})()
