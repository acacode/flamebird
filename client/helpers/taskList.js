export const createEmptyTaskList = tabs =>
  tabs.reduce((taskList, tab) => {
    taskList[tab.name] = []
    return taskList
  }, {})
