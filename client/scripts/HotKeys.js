import _ from 'lodash'
import $ from 'jquery'

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

// const TASK_LIST_ELEMENTS_QUERY = '#task-list .task'

const getTaskQueryByKeyCode = keyCode => $(`.task[char-code="${keyCode}"]`)

export default class HotKeys {
  isEnabled = false
  taskCharCodes = TASK_CHAR_CODES

  actions = {
    tab: _.noop,
    arrowUp: _.noop,
    arrowDown: _.noop,
    del: _.noop,
    shiftA: _.noop,
    shiftS: _.noop,
    shiftR: _.noop,
    shiftArrowUp: _.noop,
    shiftArrowDown: _.noop,
  }

  keyCodeActions = {
    // [shift] key is not triggered
    0: {
      38: 'arrowUp',
      40: 'arrowDown',
      46: 'del',
      9: 'tab',
    },
    // [shift] key is triggered
    1: {
      38: 'shiftArrowUp',
      40: 'shiftArrowDown',
      65: 'shiftA',
      82: 'shiftR',
      83: 'shiftS',
    },
  }

  clearifyEvent = event => {
    // event.keyCode = 0
    // event.ctrlKey = false
    // event.cancelBubble = true
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
      console.log('asdsa', shiftKey, keyCode)
      if (shiftKey) {
        this.clearifyEvent(event)
      }
      const actionName = this.keyCodeActions[+shiftKey][keyCode]
      if (actionName) {
        this.actions[actionName](event)
      } else if (!shiftKey) {
        getTaskQueryByKeyCode(keyCode).trigger('click')
      }
    }
  }

  triggerEnabled(isEnabled) {
    this.isEnabled = !!isEnabled
    console.log('triggerEnabled')
    if (this.isEnabled) {
      this.connect()
    } else {
      this.disconnect()
    }
  }

  connect() {
    window.addEventListener('keydown', this.onKeyClick, false)
    localStorage.setItem('hotkeys', true)
    document.body.setAttribute('hotkeys', 'true')

    // setTimeout(() => {
    //   _.each(
    //     document.querySelectorAll(TASK_LIST_ELEMENTS_QUERY),
    //     (element, keycodeIndex) => {
    //       element.setAttribute('char-code', this.taskCharCodes[keycodeIndex])
    //     }
    //   )
    // })
  }

  disconnect() {
    window.removeEventListener('keydown', this.onKeyClick, false)
    delete localStorage.hotkeys
    document.body.removeAttribute('hotkeys')
    // setTimeout(() => {
    //   _.each(document.querySelectorAll(TASK_LIST_ELEMENTS_QUERY), element => {
    //     element.removeAttribute('char-code')
    //   })
    // })
  }

  connectTaskButton = (taskEl, index) => {
    taskEl.setAttribute('char-code', this.taskCharCodes[index])
  }

  constructor({
    tab,
    arrowUp,
    arrowDown,
    del,
    shiftA,
    shiftS,
    shiftR,
    shiftArrowUp,
    shiftArrowDown,
  } = {}) {
    // this.triggerEnabled(true)

    _.each(
      {
        tab,
        arrowUp,
        arrowDown,
        del,
        shiftA,
        shiftS,
        shiftR,
        shiftArrowUp,
        shiftArrowDown,
      },
      (handler, handlerName) => {
        console.log('handler', handler, handlerName)
        this.actions[handlerName] = handler
      }
    )
  }
}
