import _ from 'lodash'
import $ from 'jquery'
import kinka from 'kinka'
import TaskList from './scripts/TaskList'
import WebLogger from './scripts/WebLogger'
import HotKeys from './scripts/HotKeys'
import ThemeSwitcher from './scripts/ThemeSwitcher'
import { toggleClass, el as getEl, createSpan } from './helpers/dom_utils'
import Tabs from './scripts/Tabs'
import WindowAttached from './helpers/WindowAttached'

export default new (class Global extends WindowAttached('global') {
  watchTaskLogsScrollTop = true
  theme
  logger
  taskList
  previousEnvs = null
  hotKeysEnabled = false
  notificationsEnabled = false
  fullscreen = false
  projectName = 'flamebird'
  pageIsNotActive = false

  showTaskList() {
    $(document.body).toggleClass('task-list-showed')
  }

  runAllTasks() {
    _.each(
      this.taskList.getAllFromActiveTab({ isRun: false }),
      ({ isRun, id, isActive }) => {
        this.taskList.updateTask(id, isRun, isActive, true, false)
        kinka.post(`/run/${id}`)
      }
    )
  }

  stopAllTasks() {
    _.each(
      this.taskList.getAllFromActiveTab({ isRun: true }),
      ({ isRun, id, isActive }) => {
        this.taskList.updateTask(id, isRun, isActive, false, true)
        kinka.post(`/stop/${id}`)
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
    kinka.post(`/clear-logs/${activeTask.id}`)
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
    _.each(getEl('.envs-log > input', true), function(el) {
      const input = $(el)
      this.previousEnvs[input.attr('key')] = input.val()
    })
    activeTask.envs = _.clone(this.previousEnvs)
    this.clearLogs(activeTask)
    kinka.post('/update-envs', {
      id: activeTask.id,
      envs: _.clone(this.previousEnvs),
    })
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
    const { data: rawLogs } = await kinka.get(`/logs/${id}`)
    this.logger.updateDescription(task)
    this.logger.updateEnvs(envs)
    const logs = _.map(rawLogs, this.logger.createHTMLLog).join('')
    setTimeout(function() {
      this.logger.push(logs, true)
      this.logger.scrollTo('bottom')
    }, 0)
  }

  openTask(id) {
    // const active = this.taskList.getActive()
    // if (!active || id !== active.id) {
    const task = this.taskList.getTask(id)
    if (task.id) {
      if (this.notificationsEnabled) this.taskList.setTaskUpdated(id, false)
      this.taskList.setActive(task)
      this.updateTaskLogs(task)
    }
    // }
  }
  runTask(id) {
    window.event.stopPropagation()
    const task = this.taskList.getTask(id)
    if (!task.isLaunching && !task.isRun) {
      this.taskList.setActive(task, true)
      this.updateTaskLogs(task)
      kinka.post('/run/' + task.id)
    }
  }
  stopTask(id) {
    window.event.stopPropagation()
    const task = this.taskList.getTask(id)
    if (!task.isLaunching && task.isRun) {
      this.taskList.updateTask(task.id, false, task.isActive, false, true)
      kinka.post('/stop/' + task.id)
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
      delete localStorage['notifications']
      $('.task.updated').removeClass('updated')
    }
  }

  toggleHotKeys() {
    this.hotKeysEnabled = !this.hotKeysEnabled
    this.updateHotkeys()
  }

  updateHotkeys() {
    toggleClass(getEl('.main-button.hot-keys'), 'active', this.hotKeysEnabled)
    HotKeys.setEnabled(this.hotKeysEnabled)
  }

  updateFullscreen() {
    toggleClass(getEl('.main-button.resize'), 'active', this.fullscreen)
    if (this.fullscreen) {
      localStorage.setItem('fullscreen', true)
      document.body.setAttribute('fullscreen', 'true')
    } else {
      document.body.removeAttribute('fullscreen')
      delete localStorage['fullscreen']
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

  async showProjectVersion() {
    const { data: version } = await kinka.get('/project-version')
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
      ThemeSwitcher.setTheme(localStorage.getItem('theme') || 'white')
      this.fullscreen = !!localStorage.getItem('fullscreen')
      this.hotKeysEnabled = !!localStorage.getItem('hotkeys')
      this.notificationsEnabled = !!localStorage.getItem('notifications')
      this.updateFullscreen()
      this.updateHotkeys()
      this.updateNotifications()
      const {
        data: { name, commands },
      } = await kinka.get('/info')
      this.projectName = name
      if (this.projectName) {
        $('title').text(`${this.projectName} | fb`)
        $('header > .title')
          .text(this.projectName)
          .on('mouseover', this.showProjectVersion)
          .on('mouseleave', this.hideProjectVersion)
      }
      this.taskList = window.taskList = new TaskList(
        getEl('#task-list'),
        commands
      )
      this.logger = new WebLogger(getEl('#task-logs'))
      const ws = new WebSocket(`ws://${location.host}`)
      ws.onmessage = this.receiveWsMessage
    })
  }
})()