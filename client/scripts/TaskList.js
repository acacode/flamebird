import _ from 'lodash'
import Tabs from './Tabs'
import HotKeys from './HotKeys'
import {
  toggleClass,
  addClass,
  removeClass,
  createSpan,
  createButton,
  el,
  createEl,
} from '../helpers/dom_utils'
import WindowAttached from '../helpers/WindowAttached'

export default new (class TaskList extends WindowAttached('taskList') {
  element
  taskList = {
    npm: [],
    procfile: [],
  }
  activeTaskByTab = {
    npm: [],
    procfile: [],
  }
  notifyTaskTimers = {}

  init(taskListContainer, tasks) {
    this.element = taskListContainer
    this.taskList = _.reduce(
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
      const tasks = this.getTasksByTab(tab)
      if (tasks && tasks.length) {
        this.activeTaskByTab[tab.name] = [tasks[0].id]
        if (!activeTab || tab.name === 'procfile') {
          activeTab = tab
        }
      } else {
        if (this.taskList[tab.name]) delete this.taskList[tab.name]
        Tabs.removeTab(tab)
      }
    })
    Tabs.listenChanges(this.onChangeTab)
    if (activeTab) Tabs.setActive(activeTab.name)
  }

  onChangeTab = name => {
    this.clear()
    this.updateTaskList(name)

    setTimeout(function() {
      const { name: currentName } = Tabs.getActive()
      if (name !== currentName) {
        name = currentName
      }
      if (this.activeTaskByTab[name].length) {
        el(`#${this.activeTaskByTab[name][0]}`).click()
      } else {
        global.getLogger().clear()
      }
    }, 0)
  }

  updateTaskList(tabName) {
    _.forEach(this.taskList[tabName], function(
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
      this.element.appendChild(task)
    })
  }

  getTask = id => _.find(_.concat.apply(null, _.values(this.taskList)), { id })

  updateTask(id, isRun, isActive, isLaunching, isStopping) {
    const task = this.getTask(id)
    const taskElem = document.getElementById(task.id)
    task.isRun = isRun
    task.isLaunching = !!isLaunching
    task.isStopping = !!isStopping
    task.isActive = !!isActive

    if (task.isActive) {
      const prevActiveTask = document.querySelector('.task.active')
      if (prevActiveTask) {
        const prevTaskId = this.activeTaskByTab[task.type][0]
        if (prevTaskId !== task.id) {
          this.getTask(prevTaskId).isActive = false
          removeClass(prevActiveTask, 'active')
        }
      }
      this.activeTaskByTab[task.type] = [task.id]
      addClass(taskElem, 'active')
    }
    toggleClass(taskElem, 'stopping', isStopping)
    toggleClass(taskElem, 'running', isRun)
    toggleClass(taskElem, 'clicked', isLaunching)
    return task
  }

  clear() {
    while (this.element.lastChild)
      this.element.removeChild(this.element.lastChild)
  }

  setActive(task, isLaunching, isStopping) {
    this.updateTask(
      task.id,
      task.isRun,
      true,
      isLaunching === undefined ? task.isLaunching : isLaunching,
      isStopping === undefined ? task.isStopping : isStopping
    )
  }

  getTasksByTab = tab => {
    const tasks = this.taskList[tab.name]
    return tasks && tasks.length && tasks
  }

  getAllFromActiveTab(filter) {
    const tasks = this.getTasksByTab(Tabs.getActive())
    return filter ? _.filter(tasks, filter) : tasks
  }

  getActive = () => this.getTask(this.activeTaskByTab[Tabs.getActive().name][0])

  setTaskUpdated(taskId, isUpdated, options) {
    const task = this.getTask(taskId)
    const activeTab = Tabs.getActive()
    if (!options) options = {}
    if (task.type === activeTab.name)
      el(`#${taskId}`).classList[isUpdated ? 'add' : 'remove']('updated')
    if (Notification && options.notify && isUpdated) {
      if (this.notifyTaskTimers[taskId]) {
        clearTimeout(this.notifyTaskTimers[taskId])
        this.notifyTaskTimers[taskId] = null
      }
      this.notifyTaskTimers[taskId] = setTimeout(() => {
        const task = this.getTask(taskId)
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
          notification.onclick = () => window.focus()
        } else Notification.requestPermission()
      }, 1800)
    }
  }

  constructor(taskListContainer, tasks) {
    super()
    this.init(taskListContainer, tasks)
  }
})()
