import _ from 'lodash'
import $ from 'jquery'
import Tabs from './Tabs'
import TaskList from './TaskList'

const TASK_CHAR_CODES = [
  81,
  87,
  69,
  82,
  84,
  89,
  85,
  73,
  79,
  80,
  219,
  221,
  65,
  83,
  68,
  70,
  71,
  72,
  74,
  75,
  76,
  186,
  222,
  90,
  88,
  67,
  86,
  66,
  78,
  77,
  188,
  190,
  191,
]

const TASK_LIST_ELEMENTS_QUERY = '#task-list .task'

const getTaskQueryByKeyCode = keyCode => $(`.task[char-code="${keyCode}"]`)

export default new (class HotKeys {
  isEnabled = false
  taskCharCodes = TASK_CHAR_CODES

  keyCodeActions = {
    // [shift] key is not triggered
    0: {
      9: /* [tab] */ event => {
        this.clearifyEvent(event)
        Tabs.setNextAsActive()
        return false
      },
      38: /* [arrow up] */ () =>
        window.global.getLogger().scrollTo('bottom', 0, 40),
      40: /* [arrow down] */ () =>
        window.global.getLogger().scrollTo('top', 0, 40),
      46: /* [del] */ () => window.global.clearLogs(),
    },
    // [shift] key is triggered
    1: {
      65: /* [a] */ () => window.global.runAllTasks(),
      83: /* [s] */ () => window.global.stopAllTasks(),
      82: /* [r] */ () => {
        const { isLaunching, isRun, id } = TaskList.getActive()
        if (!isLaunching) {
          window.global[`${isRun ? 'stop' : 'run'}Task`](id)
        }
      },
      38: /* [arrow up] */ () =>
        window.global.getLogger().scrollTo('top', '1500'),
      40: /* [arrow down] */ () =>
        window.global.getLogger().scrollTo('bottom', '500'),
    },
  }

  clearifyEvent = event => {
    event.keyCode = 0
    event.ctrlKey = false
    event.cancelBubble = true
    event.preventDefault()
    event.stopPropagation()
  }

  onKeyClick = event => {
    const {
      shiftKey,
      keyCode,
      target: { tagName },
    } = event
    if (_.indexOf(['INPUT', 'TEXTAREA'], tagName) === -1) {
      if (shiftKey) {
        this.clearifyEvent(event)
      }
      const action = this.keyCodeActions[+shiftKey][keyCode]
      if (action) {
        action(event)
      } else if (!shiftKey) {
        getTaskQueryByKeyCode(keyCode).trigger('click')
      }
    }
  }

  setEnabled(isEnabled) {
    this.isEnabled = isEnabled
    if (this.isEnabled) {
      this.connect()
    } else {
      this.disconnect()
    }
  }

  connect() {
    window.addEventListener('keydown', this.onKeyClick, false)
    _.each(
      document.querySelectorAll(TASK_LIST_ELEMENTS_QUERY),
      (element, keycodeIndex) => {
        element.setAttribute('char-code', this.taskCharCodes[keycodeIndex])
      }
    )
  }

  disconnect() {
    window.removeEventListener('keydown', this.onKeyClick, false)
    _.each(document.querySelectorAll(TASK_LIST_ELEMENTS_QUERY), element => {
      element.removeAttribute('char-code')
    })
  }

  constructor() {
    this.setEnabled(true)
  }
})()
