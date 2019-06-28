import reduce from 'lodash-es/reduce'

export default {
	state: {
		tasks: {
			// npm: [],
			// procfile:[],
		},
		tabs: [
			{ name: 'procfile' },
			{ name: 'npm' },
			{ name: 'grunt' },
			{ name: 'gulp' },
		],
		activeTab: null,
		activeTask: null,
  },
  getTasksByTab(tab){

  },
	createTasks(commands) {
		const tasksMap = reduce(commands, (map, task) => {
			if(!map[task.type]) { map[task.type] = [] }
			map[task.type].push(task)
			return map
		},{})
		let activeTab = null
		_.each(config.tabs, tab => {
			const tasks = this.getTasksByTab(tab)
			if (tasks) {
				activeTaskByTab[tab.name] = [tasks[0].id]
				if (!activeTab || tab.name === 'procfile') {
					activeTab = tab
				}
			} else {
				if (taskList[tab.name]) delete taskList[tab.name]
				Tabs.removeTab(tab)
			}
		})
		Tabs.listenChanges(onChangeTab)
		if (activeTab) Tabs.setActive(activeTab.name)
	}
}