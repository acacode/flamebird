import findIndex from 'lodash-es/findIndex'

export default {
	state: {
		tasks: {
			// npm: [],
			// procfile:[],
			// gulp:[],
			// grunt:[],
		}
	},
	getTasksByTab(tab) {
		if(!tab) return []
		const tasks = this.state.tasks[tab.name]
		return (tasks && tasks.length && tasks) || []
	},
	createTasks(tasksMap) {
		this.modules.tabs.createTabs(tasksMap)
		this.setState({ ...this.state, tasks: tasksMap })
		this.setActive(this.getTasksByTab(this.modules.tabs.state.activeTab)[0])
	},
	getActiveTaskByTab(tab) {
		const taskList = this.state.tasks[tab.name]
		const activeTaskIndex = findIndex(taskList, task => task.isActive)
		return activeTaskIndex > -1 ? taskList[activeTaskIndex] : null
	},
	getActiveTask() {
		return this.getActiveTaskByTab(this.modules.tabs.state.activeTab)
	},
	getTaskIndex({ id, type }) {
		return findIndex(this.state.tasks[type], task => task.id === id)
	},
	setActive(task) {
		const activeTabName = this.modules.tabs.state.activeTab.name
		const state = {...this.state}
		const prevActiveIndex = findIndex(state.tasks[activeTabName], t => t.isActive)

		if(prevActiveIndex > -1) {
			state.tasks[activeTabName][prevActiveIndex].isActive = false
			// TODO: server update
		}

		const activeTaskIndex = this.getTaskIndex(task)

		if(activeTaskIndex > -1) {
			state.tasks[task.type][activeTaskIndex].isActive = true
			// TODO: server update
		}

		this.setState(state)
	}
}