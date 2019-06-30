import each from 'lodash-es/each'
import { createTasksMap, getTasksByTab } from './helpers'

export default {
	state: {
		tasks: {
			// npm: [],
			// procfile:[],
		},
		activeTask: null,
	},
	getTasksByTab(tab) { return getTasksByTab(tab, this.state.tasks) },
	createTasks(commands) {
		const tasksMap = createTasksMap(commands)
		let activeTabName = null
		each(tasksMap, (tasks, tabName) => {
			if (tasks.length) {
				if (!activeTabName || tabName === 'procfile') {
					activeTabName = tabName
				}
			} else this.modules.tabs.removeTab(tabName)
		})
		if (activeTabName) this.modules.tabs.setActiveTab(activeTabName)
		const activeTask = tasksMap[activeTabName][0]
		this.setState({ ...this.state, tasks: tasksMap, activeTask })
	}
}