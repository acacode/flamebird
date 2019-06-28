
export const getTasksByTab = (tab, tasksMap) => {
	const tasks = tasksMap[tab.name]
	return (tasks && tasks.length && tasks) || []
}