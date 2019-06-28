import find from 'lodash-es/find'

export default {
	state: {
		tabs: [
			{ name: 'procfile' },
			{ name: 'npm' },
			{ name: 'grunt' },
			{ name: 'gulp' },
		],
		activeTab: null,
	},
	setActiveTab(name) {
		const activeTab = this.getTab(name)
		this.setState({...this.state, activeTab })
	},
	getTab(name) {
		return find(this.state.tabs, { name })
	},
	getNonActiveTabs() {
		const { activeTab, tabs } = this.state
		return activeTab ? find(tabs, { name: activeTab.name }) : tabs
	},
	setNextAsActive() {
		const { tabs, activeTab } = this.state
		const index = +!!activeTab && tabs.findIndex(tab => tab.name === activeTab.name)
		const nextTab = tabs[index + 1] || tabs[0]
		this.setActiveTab(nextTab.name)
	}
}