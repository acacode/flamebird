import reduce from 'lodash-es/reduce'

export const getTasksByTab = (tab, tasksMap) => {
	const tasks = tasksMap[tab.name]
	return (tasks && tasks.length && tasks) || []
}

export const createTasksMap = commands =>
	reduce(commands, (map, task) => {
		if(!map[task.type]) { map[task.type] = [] }
		map[task.type].push(task)
		return map
	},{})