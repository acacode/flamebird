import _ from 'lodash'
import Tabs, { PRIORITY_TAB, DEFAULT_TABS } from './Tabs'
// import HotKeys from './HotKeys'
import {
  toggleClass,
  addClass,
  removeClass,
  el,
  createEl,
} from '../helpers/dom_utils'
import WindowAttached from '../helpers/WindowAttached'
import { createEmptyTaskList } from '../helpers/taskList'

export default class TaskList extends WindowAttached('taskList') {
  element
  taskList = createEmptyTaskList(DEFAULT_TABS)
  activeTaskByTab = createEmptyTaskList(DEFAULT_TABS)
  notifyTaskTimers = {}

  init(taskListContainer, tasks, { onOpenTask, onRunTask, onStopTask } = {}) {
    this.onOpenTask = onOpenTask
    this.onRunTask = onRunTask
    this.onStopTask = onStopTask

    this.element = taskListContainer
    this.taskList = _.reduce(
      tasks,
      (taskList, task) => {
        taskList[task.type].push(task)
        return taskList
      },
      // TODO: probably we can use just this.taskList here
      createEmptyTaskList(DEFAULT_TABS)
    )
    let activeTab = null

    _.each(Tabs.getAll(), tab => {
      // FIXME: tab is undefined because we remove tab from tabs on 46-47 line
      const tasks = this.getTasksByTab(tab)
      if (tasks && tasks.length) {
        this.activeTaskByTab[tab.name] = [tasks[0].id]
        if (!activeTab || tab.name === PRIORITY_TAB.name) {
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
    const staticElements = {
      cogIcon: createEl('i', {
        className: 'fas fa-cog',
      }),
      playIcon: createEl('i', {
        className: 'fas fa-play',
      }),
      stopIcon: createEl('i', {
        className: 'fas fa-stop',
      }),
    }
    _.forEach(this.taskList[tabName], (task, index) => {
      const { isRun, isLaunching, isActive, name, id } = task

      const taskElement = createEl('div', {
        className: [
          'task',
          'task-num-' + (index + 1),
          isRun && 'running',
          isLaunching && 'clicked',
          isActive && 'active',
        ].join(' '),
        id,
        onclick: () => this.onOpenTask(task),
        children: [
          staticElements.cogIcon,
          createEl('span', {
            className: 'task-name',
            innerText: name,
          }),
          createEl('button', {
            className: 'run-task',
            onclick: () => this.onRunTask(task),
            children: [staticElements.playIcon],
          }),
          createEl('button', {
            className: 'stop-task',
            onclick: () => this.onStopTask(task),
            children: [staticElements.stopIcon],
          }),
        ],
      })
      // TODO: ???
      // if (HotKeys.isEnabled) {
      //   HotKeys.connect(task, index)
      // }
      this.element.appendChild(taskElement)
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
}
