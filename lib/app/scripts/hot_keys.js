window.HotKeys = (function() {
  let isEnabled = false
  const taskCharCodes = [
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

  const keyCodeActions = {
    // [shift] key is not triggered
    0: {
      9: /* [tab] */ event => {
        clearifyEvent(event)
        Tabs.setActive(taskList.getActiveTab() === 'npm' ? 'procfile' : 'npm')
        return false
      },
      38: /* [arrow up] */ () =>
        window.global.getLogger().scrollTo('bottom', 0, 40),
      40: /* [arrow down] */ () =>
        window.global.getLogger().scrollTo('top', 0, 40),
      46: /* [del] */ window.global.clearLogs,
    },
    // [shift] key is triggered
    1: {
      65: /* [a] */ window.global.runAllTasks,
      83: /* [s] */ window.global.stopAllTasks,
      82: /* [r] */ () => {
        const { isLaunching, isRun, id } = taskList.getActive()
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

  // const keyCodes = {
  //   tab: 9,
  //   a: 65,
  //   s: 83,
  //   arrowTop: 38,
  //   arrowDown: 40,
  //   deleteButton: 46,
  //   runButton: 82,
  // }

  const clearifyEvent = event => {
    event.keyCode = 0
    event.ctrlKey = false
    event.cancelBubble = true
    event.preventDefault()
    event.stopPropagation()
  }

  // let keyClickTimer = null
  function onKeyClick(event) {
    // if (keyClickTimer) {
    //   clearTimeout(keyClickTimer)
    //   keyClickTimer = null
    // }
    // keyClickTimer = setTimeout(() => {
    const { shiftKey, keyCode, target: { tagName } } = event
    if (_.indexOf(['INPUT', 'TEXTAREA'], tagName) === -1) {
      if (shiftKey) {
        clearifyEvent(event)
      }
      const action = keyCodeActions[+shiftKey][keyCode]
      if (action) {
        action(event)
      } else if (!shiftKey) {
        $(`.task[char-code="${keyCode}"]`).trigger('click')
      }
    }
    // }, 66)
  }

  function setEnabled(enabled) {
    isEnabled = enabled
    if (isEnabled) {
      window.addEventListener('keydown', onKeyClick, false)
    } else {
      window.removeEventListener('keydown', onKeyClick)
    }
  }

  function connect(element, indexKeycode) {
    element.setAttribute('char-code', taskCharCodes[indexKeycode])
  }

  _.each(document.querySelectorAll('#task-list .task'), connect)

  setEnabled(true)

  return {
    setEnabled: setEnabled,
    isEnabled: () => isEnabled,
    connect: connect,
  }
})()
