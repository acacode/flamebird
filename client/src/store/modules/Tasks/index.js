import each from 'lodash-es/each'
import findIndex from 'lodash-es/findIndex'
import { createTasksMap, getTasksByTab } from './helpers'

export default {
	state: {
		tasks: {
			// npm: [],
			// procfile:[],
		},
		activeTaskIndex: null,
	},
	getTasksByTab(tab) { return getTasksByTab(tab, this.state.tasks) },
	createTasks(commands) {
		const tasksMap = createTasksMap(commands)
		let activeTabName = null
		each(tasksMap, (tasks, tabName) => {
			if (tasks.length) {
				this.modules.tabs.createTab(tabName)
				if (!activeTabName || tabName === 'procfile') {
					activeTabName = tabName
				}
			}
		})
		if (activeTabName) this.modules.tabs.setActiveTab(activeTabName)
		this.setState({ ...this.state, tasks: tasksMap })
		this.setActive(tasksMap[activeTabName][0])
	},
	getTaskIndex({ id, type }) {
		return findIndex(this.state.tasks[type], task => task.id === id)
	},
	setActive(task) {
		const state = {...this.state}
		const activeTaskIndex = this.getTaskIndex(task)
		state.tasks[task.type][activeTaskIndex].isActive = true
		this.setState({...state, activeTaskIndex })
	}
}