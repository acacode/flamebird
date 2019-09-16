import { createEl } from './dom_utils'

export const createEmptyTaskList = tabs =>
  tabs.reduce((taskList, tab) => {
    taskList[tab.name] = []
    return taskList
  }, {})

export const createTaskElement = (
  { isRun, isLaunching, isActive, id, name },
  index,
  { onOpenTask, onRunTask, onStopTask }
) => {
  return createEl('div', {
    className: [
      'task',
      'task-num-' + (index + 1),
      isRun && 'running',
      isLaunching && 'clicked',
      isActive && 'active',
    ].join(' '),
    id,
    onclick: onOpenTask,
    children: [
      createEl('i', {
        className: 'fas fa-cog',
      }),
      createEl('span', {
        className: 'task-name',
        innerText: name,
      }),
      createEl('button', {
        className: 'run-task',
        onclick: onRunTask,
        children: [
          createEl('i', {
            className: 'fas fa-play',
          }),
        ],
      }),
      createEl('button', {
        className: 'stop-task',
        onclick: onStopTask,
        children: [
          createEl('i', {
            className: 'fas fa-stop',
          }),
        ],
      }),
    ],
  })
}
