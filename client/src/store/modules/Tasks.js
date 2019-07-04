import findIndex from 'lodash-es/findIndex'

export default {
  notifyTaskTimers: {},
  state: {
    tasks: {
      // npm: [],
      // procfile:[],
      // gulp:[],
      // grunt:[],
    }
  },
  getTasksByTab(tab) {
    if (!tab) return []
    const tasks = this.state.tasks[tab.name]
    return (tasks && tasks.length && tasks) || []
  },
  createTasks(tasksMap) {
    this.modules.tabs.createTabs(tasksMap)
    this.setState({ ...this.state, tasks: tasksMap })
    this.setActive(this.getTasksByTab(this.modules.tabs.state.activeTab)[0])
  },
  getActiveTaskByTab(tab) {
    const taskList = this.state.tasks[tab.name]
    const activeTaskIndex = findIndex(taskList, task => task.isActive)
    return activeTaskIndex > -1 ? taskList[activeTaskIndex] : null
  },
  getActiveTask() {
    return this.getActiveTaskByTab(this.modules.tabs.state.activeTab)
  },
  getTaskIndex({ id, type }) {
    return findIndex(this.state.tasks[type], task => task.id === id)
  },
  setActive(task) {
    this.updateTask(this.getActiveTask(), { isActive: false })
    this.updateTask(task, { isActive: true })
  },
  updateTask(task, changes) {
    if (!task || !task.id) {
      return
    }
    const taskIndex = this.getTaskIndex(task)

    if (taskIndex > -1) {
      const state = { ...this.state }
      state.tasks[task.type][taskIndex] = {
        ...task,
        ...(changes || {})
      }
      this.setState(state)
    }
  },
  notifyTaskUpdated(task, isUpdated, options) {
    if (!this.modules.extensions.state.notifications) return
    const activeTab = this.modules.tabs.getActive()
    if (!options) options = {}
    if (task.type === activeTab.name)
      this.updateTask(task, { isUpdated: !!isUpdated })
    if (Notification && options.notify && isUpdated) {
      if (this.notifyTaskTimers[task.id]) {
        clearTimeout(this.notifyTaskTimers[task.id])
        delete this.notifyTaskTimers[task.id]
      }
      this.notifyTaskTimers[task.id] = setTimeout(() => {
        const createNotification = () => {
          const notification = new Notification(
            `"${task.name}" has been updated`,
            {
              icon: 'logo/logo2_small.png',
              body:
                `project: ${options.projectName}` +
                `\r\ntaskfile: [${task.type}]` +
                '\r\nlatest message: ' +
                options.log
            }
          )
          notification.onclick = () => window.document.body.focus()
        }
        if (Notification.permission === 'granted') createNotification()
        else Notification.requestPermission().then(createNotification)
      }, 1800)
    }
  }
}
