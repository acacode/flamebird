import each from "lodash-es/each"
import find from "lodash-es/find"
import findIndex from "lodash-es/findIndex"

const PRIORITY_FIRST_ACTIVE_TAB = "procfile"

export default {
  state: {
    tabs: [],
    activeTab: null
  },
  setActive(name) {
    const activeTab = this.getTab(name)
    this.setState({ ...this.state, activeTab })
  },
  createTab(name) {
    const tabs = [...this.state.tabs, { name }]
    this.setState({ ...this.state, tabs })
  },
  createTabs(tasksMap) {
    let activeTabName = null
    each(tasksMap, (tasks, tabName) => {
      if (tasks.length) {
        this.createTab(tabName)
        if (!activeTabName || tabName === PRIORITY_FIRST_ACTIVE_TAB) {
          activeTabName = tabName
        }
      }
    })
    if (activeTabName) this.setActive(activeTabName)
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
    const index =
      +!!activeTab && tabs.findIndex(tab => tab.name === activeTab.name)
    const nextTab = tabs[index + 1] || tabs[0]
    this.setActive(nextTab.name)
  },
  removeTab(name) {
    const tabs = [...this.state.tabs]
    const removeTabIndex = findIndex(tabs, tab => tab.name === name)
    if (removeTabIndex > -1) {
      tabs.splice(removeTabIndex, 1)
    }
    console.log("tabs", tabs)
    this.setState({ ...this.state, tabs })
  }
}
