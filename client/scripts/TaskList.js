import _ from 'lodash'
import Tabs, { PRIORITY_TAB, DEFAULT_TABS } from './Tabs'
// import HotKeys from './HotKeys'
import { toggleClass, addClass, removeClass, el } from '../helpers/dom_utils'
import WindowAttached from '../helpers/WindowAttached'
import { createEmptyTaskList, createTaskElement } from '../helpers/taskList'

const TASK_CLASSES = {
  ACTIVE: 'active',
  STOPPING: 'stopping',
  RUNNING: 'running',
  LAUNCHING: 'clicked',
  UPDATED: 'updated',
}

export default class TaskList extends WindowAttached('taskList') {
  element
  taskList = createEmptyTaskList(DEFAULT_TABS)
  activeTaskByTab = createEmptyTaskList(DEFAULT_TABS)
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
    this.taskList = _.reduce(
      tasks,
      (taskList, task) => {
        taskList[task.type].push(task)
        return taskList
      },
      // TODO: probably we can use just this.taskList here
      this.taskList
    )
    let activeTab = null

    for (let x = 0, allTabs = Tabs.getAll(); x < allTabs.length; x++) {
      const tab = allTabs[x]
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
    // _.each(Tabs.getAll(), tab => {
    //   // FIXME: tab is undefined because we remove tab from tabs on 46-47 line
    //   const tasks = this.getTasksByTab(tab)
    //   if (tasks && tasks.length) {
    //     this.activeTaskByTab[tab.name] = [tasks[0].id]
    //     if (!activeTab || tab.name === PRIORITY_TAB.name) {
    //       activeTab = tab
    //     }
    //   } else {
    //     if (this.taskList[tab.name]) delete this.taskList[tab.name]
    //     Tabs.removeTab(tab)
    //   }
    // })

    Tabs.listenChanges(this.onChangeTab)

    if (activeTab) Tabs.setActive(activeTab.name)
  }

  onChangeTab = name => {
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

  updateTask(id, isRun, isActive, isLaunching, isStopping) {
    const task = this.getTask(id)
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
}
