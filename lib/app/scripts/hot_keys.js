/* global $, taskList,  _  */

window.HotKeys = (function() { //eslint-disable-line
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

  const clearifyEvent = event => {
    event.keyCode = 0
    event.ctrlKey = false
    event.cancelBubble = true
    event.preventDefault()
    event.stopPropagation()
  }

  function onKeydown(event) {
    const { shiftKey, keyCode, target: { tagName } } = event
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
      const { stopTask, runTask, handleClickTab } = window.global
      if (shiftKey) {
        if (keyCode === 82) {
          clearifyEvent(event)
          const { isStartRunning, isRun, name } = taskList.getActive()
          if (!isStartRunning) {
            ;(isRun ? stopTask : runTask)(name)
          }
          return false
        }
      } else {
        if (keyCode === 9) {
          handleClickTab(taskList.getActiveTab() === 'npm' ? 'procfile' : 'npm')
        } else {
          $(`.task[char-code="${keyCode}"]`).trigger('click')
        }
      }
    }
  }

  function setEnabled(enabled) {
    isEnabled = enabled
    if (isEnabled) {
      window.addEventListener('keydown', onKeydown, false)
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  }

  function connect(element, indexKeycode) {
    element.setAttribute('char-code', taskCharCodes[indexKeycode])
  }

  _.each(document.querySelectorAll('#tasks .task'), connect)

  setEnabled(true)

  return {
    setEnabled: setEnabled,
    isEnabled: () => isEnabled,
    connect: connect,
  }
})()
