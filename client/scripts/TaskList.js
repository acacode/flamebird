import _ from 'lodash'
import Tabs, { PRIORITY_TAB } from './Tabs'
// import HotKeys from './HotKeys'
import { toggleClass, addClass, removeClass, el } from '../helpers/dom_utils'
import { createTab } from '../helpers/tabs'
import WindowAttached from '../helpers/WindowAttached'
import { createTaskElement } from '../helpers/taskList'

const TASK_CLASSES = {
  ACTIVE: 'active',
  STOPPING: 'stopping',
  RUNNING: 'running',
  LAUNCHING: 'clicked',
  UPDATED: 'updated',
}

export default class TaskList extends WindowAttached('taskList') {
  element
  taskList = {}
  activeTaskByTab = {}
  notifyTaskTimers = {}

  constructor(
    taskListContainer,
    tasks,
    { onOpenTask, onRunTask, onStopTask, onCreateTaskEl } = {}
  ) {
    super()
    this.onOpenTask = onOpenTask || _.noop
    this.onRunTask = onRunTask || _.noop
    this.onStopTask = onStopTask || _.noop
    this.onStopTask = onStopTask || _.noop
    this.onCreateTaskEl = onCreateTaskEl || _.noop

    this.element = taskListContainer

    Tabs.listenChanges(this.handleTabChange)
    this.initalizeTasks(tasks)
  }

  initalizeTasks = tasks => {
    this.element.innerHTML = ''

    this.taskList = {}
    this.activeTaskByTab = {}

    this.taskList = _.reduce(
      tasks,
      (taskList, task) => {
        if (!taskList[task.type]) {
          taskList[task.type] = []
        }
        taskList[task.type].push(task)
        return taskList
      },
      // TODO: probably we can use just this.taskList here
      this.taskList
    )

    const tabs = _.map(_.keys(this.taskList), tabName => {
      this.activeTaskByTab[tabName] = {}
      return createTab(tabName, tabName === PRIORITY_TAB.name)
    })

    Tabs.createTabs(tabs)

    let activeTab = null

    for (let x = 0; x < tabs.length; x++) {
      const tab = tabs[x]
      if (tab) {
        const tasks = this.getTasksByTab(tab)
        if (tasks && tasks.length) {
          this.activeTaskByTab[tab.name] = [tasks[0].id]
          if (!activeTab || tab.name === PRIORITY_TAB.name) {
            activeTab = tab
          }
        } else {
          delete this.taskList[tab.name]
          delete this.activeTaskByTab[tab.name]
          Tabs.removeTab(tab)
          x--
        }
      }
    }

    if (activeTab) Tabs.setActive(activeTab.name)
  }

  handleTabChange = name => {
    this.clear()
    this.updateTaskList(name)

    setTimeout(() => {
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
    _.forEach(this.taskList[tabName], (task, index) => {
      // TODO: ???
      // if (HotKeys.isEnabled) {
      //   HotKeys.connect(task, index)
      // }
      const taskEl = createTaskElement(task, index, {
        onOpenTask: () => this.onOpenTask(task),
        onRunTask: () => this.onRunTask(task),
        onStopTask: () => this.onStopTask(task),
      })

      this.onCreateTaskEl(taskEl, index)

      this.element.appendChild(taskEl)
    })
  }

  getTask = id => _.find(_.concat.apply(null, _.values(this.taskList)), { id })

  updateTask(id, { isRun, isActive, isLaunching, isStopping }) {
    const task = this.getTask(id)

    // TODO: fix task as undefined

    const taskElem = document.getElementById(task.id)
    task.isRun = isRun
    task.isLaunching = !!isLaunching
    task.isStopping = !!isStopping
    task.isActive = !!isActive

    if (task.isActive) {
      const prevActiveTask = document.querySelector(
        `.task.${TASK_CLASSES.ACTIVE}`
      )
      if (prevActiveTask) {
        const prevTaskId = this.activeTaskByTab[task.type][0]
        if (prevTaskId !== task.id) {
          this.getTask(prevTaskId).isActive = false
          removeClass(prevActiveTask, TASK_CLASSES.ACTIVE)
        }
      }
      this.activeTaskByTab[task.type] = [task.id]
      addClass(taskElem, TASK_CLASSES.ACTIVE)
    }
    toggleClass(taskElem, TASK_CLASSES.STOPPING, isStopping)
    toggleClass(taskElem, TASK_CLASSES.RUNNING, isRun)
    toggleClass(taskElem, TASK_CLASSES.LAUNCHING, isLaunching)
    return task
  }

  clear() {
    while (this.element.lastChild)
      this.element.removeChild(this.element.lastChild)
  }

  setActive(task, isLaunching, isStopping) {
    this.updateTask(task.id, {
      isRun: task.isRun,
      isActive: true,
      isLaunching: isLaunching === undefined ? task.isLaunching : isLaunching,
      isStopping: isStopping === undefined ? task.isStopping : isStopping,
    })
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

  notifyAboutTask(taskId, isUpdated, options) {
    const task = this.getTask(taskId)
    const activeTab = Tabs.getActive()
    if (!options) options = {}
    if (task.type === activeTab.name)
      el(`#${taskId}`).classList[isUpdated ? 'add' : 'remove'](
        TASK_CLASSES.UPDATED
      )
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
                `project: ${options.projectName}\r\n` +
                `taskfile: [${task.type}]\r\n` +
                'latest message: \r\n' +
                `...${options.log
                  .split('')
                  .splice(-22)
                  .join('')}`,
            }
          )
          notification.onclick = () => window.focus()
        } else Notification.requestPermission()
      }, 2800)
    }
  }
}
