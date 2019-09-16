import _ from 'lodash'
import $ from 'jquery'
import api from './scripts/Api'
import TaskList from './scripts/TaskList'
import WebLogger from './scripts/WebLogger'
import HotKeys from './scripts/HotKeys'
import { el as getEl } from './helpers/dom_utils'
import Tabs from './scripts/Tabs'
import WindowAttached from './helpers/WindowAttached'
import { clearifyEvent } from './helpers/hotKeys'
import { Header } from './controllers/Header'
import WebSocket from './scripts/WebSocket'
import ConfigsManager from './scripts/Configs'

export const DEFAULT_PROJECT_NAME = 'flamebird'

class Global extends WindowAttached('global') {
  watchTaskLogsScrollTop = true
  setTheme
  previousEnvs = null
  projectName = DEFAULT_PROJECT_NAME
  pageIsNotActive = false

  configsManager = new ConfigsManager('.configs-list', {
    // TODO: fix config as undefined
    onSetConfig: config => this.handleConfigSet(config),
    getConfigs: async () => {
      const {
        data: { configs },
      } = await api.getProjectInfo()
      return configs || []
    },
    onRemoveConfig: config => {
      const activeConfig = this.configsManager.getActiveConfig()

      // TODO: fix activeConfig as undefined
      if (activeConfig.id === config.id) {
        this.configsManager.setConfig(0)
      }
      this.stopAllTasks(config)
      api.removeConfig(config.id)
    },
  })

  logger
  taskList = null
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

  header = new Header({ hotkeys: this.hotkeys })

  showTaskList() {
    $(document.body).toggleClass('task-list-showed')
  }

  handleConfigSet = ({ commands, name }) => {
    this.setProjectName(name)

    if (this.taskList) {
      this.taskList.initalizeTasks(commands)
    } else {
      this.taskList = new TaskList(getEl('#task-list'), commands, {
        onOpenTask: this.openTask,
        onRunTask: this.runTask,
        onStopTask: this.stopTask,
        onCreateTaskEl: this.onCreateTaskEl,
      })
    }
  }

  runAllTasks(config = this.configsManager.getActiveConfig()) {
    _.each(
      this.taskList.getAllFromActiveTab({ isRun: false }),
      ({ isRun, id, isActive }) => {
        this.taskList.updateTask(id, { isRun, isActive, isLaunching: true })
        api.runTask(config.id, id)
      }
    )
  }

  stopAllTasks(config = this.configsManager.getActiveConfig()) {
    _.each(
      this.taskList.getAllFromActiveTab({ isRun: true }),
      ({ isRun, id, isActive }) => {
        this.taskList.updateTask(id, { isRun, isActive, isStopping: true })
        api.stopTask(config.id, id)
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
    const config = this.configsManager.getActiveConfig()
    api.clearLogs(config.id, activeTask.id)
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
    const config = this.configsManager.getActiveConfig()
    api.updateEnvs(config.id, activeTask.id, this.previousEnvs)
    this.taskList.updateTask(activeTask.id, {
      isRun: true,
      isActive: activeTask.isActive,
      isLaunching: true,
    })
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
    const config = this.configsManager.getActiveConfig()
    const { data: rawLogs } = await api.getLogs(config.id, id)
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
      if (this.header.notificationsEnabled)
        this.taskList.notifyAboutTask(task.id, false)
      this.taskList.setActive(task)
      this.updateTaskLogs(task)
    }
    // }
  }

  runTask = task => {
    window.event.stopPropagation()
    // const task = this.taskList.getTask(id)
    if (!task.isLaunching && !task.isRun) {
      const config = this.configsManager.getActiveConfig()
      this.taskList.setActive(task, true)
      this.updateTaskLogs(task)
      api.runTask(config.id, task.id)
    }
  }

  stopTask = task => {
    window.event.stopPropagation()
    // const task = this.taskList.getTask(id)
    if (!task.isLaunching && task.isRun) {
      const config = this.configsManager.getActiveConfig()
      this.taskList.updateTask(task.id, {
        isActive: task.isActive,
        isStopping: true,
      })
      api.stopTask(config.id, task.id)
    }
  }

  onCreateTaskEl = (taskEl, index) => {
    if (this.hotkeys.isEnabled) {
      this.hotkeys.connectTaskButton(taskEl, index)
    }
  }

  handleOnUpdateLog = ({ name, id, isRun, isLaunching, isStopping, log }) => {
    if (name) {
      const isActive = id === this.taskList.getActive().id
      this.taskList.updateTask(id, {
        isRun,
        isActive,
        isLaunching,
        isStopping,
      })
      if (log) {
        if (isActive) {
          this.logger.push(log)
          if (this.watchTaskLogsScrollTop) this.logger.scrollTo('bottom')
          if (this.header.notificationsEnabled && this.pageIsNotActive) {
            this.taskList.notifyAboutTask(id, true, {
              notify: this.header.notificationsEnabled,
              projectName: this.projectName,
              log,
            })
          }
        } else if (this.header.notificationsEnabled) {
          this.taskList.notifyAboutTask(id, true, {
            notify: this.header.notificationsEnabled,
            log,
            projectName: this.projectName,
          })
        }
      }
    }
  }

  getLogger = () => this.logger
  getTaskList = () => this.taskList

  setProjectName = name => {
    this.projectName = name
    if (this.projectName) {
      $('title').text(`${this.projectName} | fb`)
      $('.title span').text(this.projectName)
    }
  }

  constructor() {
    super()
    $(document).ready(async () => {
      $(window).focus(() => {
        this.pageIsNotActive = false
        if (this.header.notificationsEnabled) {
          this.taskList.notifyAboutTask(this.taskList.getActive().id, false)
        }
      })

      $(window).blur(() => {
        this.pageIsNotActive = true
      })

      this.configsManager
        .refreshConfigs()
        .then(() => this.configsManager.setConfig(0))

      this.logger = new WebLogger(getEl('#task-logs'))
      this.websocket = new WebSocket(`ws://${location.host}`, {
        onLogUpdate: this.handleOnUpdateLog,
        onAppListUpdate: this.configsManager.refreshConfigs,
      })
    })
  }
}

export default new Global()
