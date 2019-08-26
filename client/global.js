import _ from 'lodash'
import $ from 'jquery'
import Api from './scripts/Api'
import TaskList from './scripts/TaskList'
import WebLogger from './scripts/WebLogger'
import HotKeys from './scripts/HotKeys'
import ThemeSwitcher, { THEMES } from './scripts/ThemeSwitcher'
import { toggleClass, el as getEl, createSpan } from './helpers/dom_utils'
import Tabs from './scripts/Tabs'
import WindowAttached from './helpers/WindowAttached'
import { clearifyEvent } from './helpers/hotKeys'

export const DEFAULT_PROJECT_NAME = 'flamebird'

export default new (class Global extends WindowAttached('global') {
  watchTaskLogsScrollTop = true
  setTheme
  previousEnvs = null
  hotKeysEnabled = false
  notificationsEnabled = false
  fullscreen = false
  projectName = DEFAULT_PROJECT_NAME
  pageIsNotActive = false

  api = new Api()
  logger
  taskList
  themeSwitcher = new ThemeSwitcher({
    onSwitchTheme: newTheme => {
      $('.toggle.color').toggleClass('active', newTheme === THEMES.DARK)
    },
  })

  hotkeys = new HotKeys({
    tab: event => {
      clearifyEvent(event)
      Tabs.setNextAsActive()
      return false
    },
    arrowUp: () => this.logger.scrollTo('bottom', 0, 40),
    arrowDown: () => this.logger.scrollTo('top', 0, 40),
    del: () => this.clearLogs(),
    shiftA: () => this.runAllTasks(),
    shiftS: () => this.stopAllTasks(),
    shiftR: () => {
      const activeTask = this.taskList.getActive()
      if (!activeTask.isLaunching) {
        if (activeTask.isRun) {
          this.stopTask(activeTask)
        } else {
          this.runTask(activeTask)
        }
      }
    },
    shiftArrowUp: () => this.logger.scrollTo('top', '1500'),
    shiftArrowDown: () => this.logger.scrollTo('bottom', '500'),
  })

  showTaskList() {
    $(document.body).toggleClass('task-list-showed')
  }

  runAllTasks() {
    _.each(
      this.taskList.getAllFromActiveTab({ isRun: false }),
      ({ isRun, id, isActive }) => {
        this.taskList.updateTask(id, isRun, isActive, true, false)
        this.api.runTask(id)
      }
    )
  }

  stopAllTasks() {
    _.each(
      this.taskList.getAllFromActiveTab({ isRun: true }),
      ({ isRun, id, isActive }) => {
        this.taskList.updateTask(id, isRun, isActive, false, true)
        this.api.stopTask(id)
      }
    )
  }

  clearLogs(activeTask) {
    if (!activeTask) {
      activeTask = this.taskList.getActive()
    }
    if (_.isString(activeTask)) {
      activeTask = this.taskList.getTask(activeTask)
    }
    this.api.clearLogs(activeTask.id)
    activeTask.logs = []
    this.logger.clear()
    this.logger.updateDescription(activeTask.task)
    this.logger.updateEnvs(activeTask.envs)
  }

  triggerScrollWatcher(e) {
    this.logger.scrollTo('bottom', '1500')
    this.watchTaskLogsScrollTop = !this.watchTaskLogsScrollTop
    $('.logs-button.autoscroll').toggleClass(
      'active',
      this.watchTaskLogsScrollTop
    )
  }

  handleClickTab(tab) {
    if (tab !== Tabs.getActive().name) {
      Tabs.setActive(tab)
    }
  }

  enableEnvsForm() {
    getEl('.envs-log').classList.add('active')
    this.previousEnvs = _.clone(this.taskList.getActive().envs)
  }

  updateEnvs() {
    getEl('.envs-log').classList.remove('active')
    const activeTask = this.taskList.getActive()
    _.each(getEl('.envs-log > input', true), el => {
      const input = $(el)
      this.previousEnvs[input.attr('key')] = input.val()
    })
    activeTask.envs = _.clone(this.previousEnvs)
    this.clearLogs(activeTask)
    this.api.updateEnvs(activeTask.id, this.previousEnvs)
    this.taskList.updateTask(
      activeTask.id,
      true,
      activeTask.isActive,
      true,
      false
    )
    this.previousEnvs = null
  }

  cancelEnvs() {
    getEl('.envs-log').classList.remove('active')
    _.each(getEl('.envs-log > input', true), el => {
      const input = $(el)
      input.val(this.previousEnvs[input.attr('key')])
    })
    this.taskList.getActive().envs = _.clone(this.previousEnvs)
    this.previousEnvs = null
  }

  async updateTaskLogs({ task, envs, id }) {
    this.logger.clear()
    const { data: rawLogs } = await this.api.getLogs(id)
    this.logger.updateDescription(task)
    this.logger.updateEnvs(envs)
    const logs = _.map(rawLogs, this.logger.createHTMLLog).join('')
    setTimeout(() => {
      this.logger.push(logs, true)
      this.logger.scrollTo('bottom')
    }, 0)
  }

  openTask = task => {
    // const active = this.taskList.getActive()
    // if (!active || id !== active.id) {
    if (task.id) {
      if (this.notificationsEnabled)
        this.taskList.setTaskUpdated(task.id, false)
      this.taskList.setActive(task)
      this.updateTaskLogs(task)
    }
    // }
  }

  runTask = task => {
    window.event.stopPropagation()
    // const task = this.taskList.getTask(id)
    if (!task.isLaunching && !task.isRun) {
      this.taskList.setActive(task, true)
      this.updateTaskLogs(task)
      this.api.runTask(task.id)
    }
  }

  stopTask = task => {
    window.event.stopPropagation()
    // const task = this.taskList.getTask(id)
    if (!task.isLaunching && task.isRun) {
      this.taskList.updateTask(task.id, false, task.isActive, false, true)
      this.api.stopTask(task.id)
    }
  }

  onCreateTaskEl = (taskEl, index) => {
    if (this.hotkeys.isEnabled) {
      this.hotkeys.connectTaskButton(taskEl, index)
    }
  }

  toggleNotifications() {
    this.notificationsEnabled = !this.notificationsEnabled
    this.updateNotifications()
  }

  updateNotifications() {
    toggleClass(
      getEl('.main-button.notifications'),
      'active',
      this.notificationsEnabled
    )
    if (this.notificationsEnabled) {
      localStorage.setItem('notifications', true)
    } else {
      delete localStorage.notifications
      $('.task.updated').removeClass('updated')
    }
  }

  toggleHotKeys() {
    this.hotKeysEnabled = !this.hotKeysEnabled
    this.updateHotkeys()
  }

  updateHotkeys() {
    toggleClass(getEl('.main-button.hot-keys'), 'active', this.hotKeysEnabled)
    this.hotkeys.triggerEnabled(this.hotKeysEnabled)
  }

  updateFullscreen() {
    toggleClass(getEl('.main-button.resize'), 'active', this.fullscreen)
    if (this.fullscreen) {
      localStorage.setItem('fullscreen', true)
      document.body.setAttribute('fullscreen', 'true')
    } else {
      document.body.removeAttribute('fullscreen')
      delete localStorage.fullscreen
    }
  }

  toggleResize() {
    this.fullscreen = !this.fullscreen
    this.updateFullscreen()
  }

  receiveWsMessage = ({ data }) => {
    const { name, id, isRun, isLaunching, isStopping, log } = JSON.parse(data)
    if (name) {
      const isActive = id === this.taskList.getActive().id
      this.taskList.updateTask(id, isRun, isActive, isLaunching, isStopping)
      if (log) {
        if (isActive) {
          this.logger.push(log)
          if (this.watchTaskLogsScrollTop) this.logger.scrollTo('bottom')
          if (this.notificationsEnabled && this.pageIsNotActive) {
            this.taskList.setTaskUpdated(id, true, {
              notify: this.notificationsEnabled,
              projectName: this.projectName,
              log,
            })
          }
        } else if (this.notificationsEnabled) {
          this.taskList.setTaskUpdated(id, true, {
            notify: this.notificationsEnabled,
            log,
            projectName: this.projectName,
          })
        }
      }
    }
  }

  showProjectVersion = async () => {
    const { data: version } = await this.api.getProjectInfo()
    if (version) {
      $('header > .title').html(
        this.projectName + createSpan('project-version', version)
      )
    }
  }

  hideProjectVersion() {
    $('header > .title').text(this.projectName)
  }

  getLogger = () => this.logger
  getTaskList = () => this.taskList

  constructor() {
    super()

    $(window).focus(() => {
      this.pageIsNotActive = false
      if (this.notificationsEnabled) {
        this.taskList.setTaskUpdated(this.taskList.getActive().id, false)
      }
    })

    $(window).blur(() => {
      this.pageIsNotActive = true
    })

    $(document).ready(async () => {
      this.themeSwitcher.setTheme(localStorage.getItem('theme') || 'white')

      this.fullscreen = !!localStorage.getItem('fullscreen')
      this.hotKeysEnabled = !!localStorage.getItem('hotkeys')
      this.notificationsEnabled = !!localStorage.getItem('notifications')

      this.updateFullscreen()
      this.updateHotkeys()
      this.updateNotifications()

      const {
        data: { name, commands },
      } = await this.api.getProjectInfo()

      this.projectName = name
      if (this.projectName) {
        $('title').text(`${this.projectName} | fb`)
        $('header > .title')
          .text(this.projectName)
          .on('mouseover', this.showProjectVersion)
          .on('mouseout', this.hideProjectVersion)
      }
      this.taskList = new TaskList(getEl('#task-list'), commands, {
        onOpenTask: this.openTask,
        onRunTask: this.runTask,
        onStopTask: this.stopTask,
        onCreateTaskEl: this.onCreateTaskEl,
      })
      this.logger = new WebLogger(getEl('#task-logs'))
      const ws = new WebSocket(`ws://${location.host}`)
      ws.onmessage = this.receiveWsMessage
    })
  }
})()
