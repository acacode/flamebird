var TaskList = (function() {// eslint-disable-line
  var element

  function updateTaskList() {}

  function openTask() {}
  function runTask() {}
  function stopTask() {}

  return function(el) {
    element = el
    return {
      updateTaskList: updateTaskList,
      openTask: openTask,
      runTask: runTask,
      stopTask: stopTask,
    }
  }
})()
