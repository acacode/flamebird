class FlamebirdTabs {
  wrapper = null
  onChangeListeners = []

  tabs = [
    { name: 'procfile', active: true },
    { name: 'npm' },
    { name: 'grunt' },
    { name: 'gulp' },
  ]

  activeTab = _.find(this.tabs, { active: true })

  constructor(wrapperElement, tabsContainer) {
    this.wrapper = wrapperElement
    tabs.forEach(tab => {
      createEl('button', {
        className: 'tab' + (tab.active ? ' active' : ''),
        id: tab.name,
        innerText: tab.name,
        onclick: () => Tabs.setActive(tab.name),
        parent: tabsContainer,
      })
    })
  }

  getAll = () => tabs

  getNotActiveTabs = () => _.find(this.tabs, { active: false })

  getTab = name => _.find(this.tabs, { name })

  getActive = () => this.activeTab

  setActive = name => {
    let prevTab = this.activeTab
    // if (prevTab.name !== name) {
    if (this.getTab(prevTab.name)) {
      prevTab.active = false
      el(`#${prevTab.name}`).classList.remove('active')
    }
    const nextTab = this.getTab(name)
    nextTab.active = true
    this.activeTab = nextTab
    el(`#${nextTab.name}`).classList.add('active')
    if (this.onChangeListeners.length) {
      this.onChangeListeners.forEach(listener =>
        listener(nextTab.name, prevTab.name)
      )
    }
    this.wrapper.className = `wrapper active-tab-${nextTab.name}`
    return nextTab
    // }
    // return null
  }

  setNextAsActive() {
    let index = this.tabs.findIndex(tab => tab.name === this.activeTab.name)
    if (typeof this.tabs[index + 1] !== 'undefined') {
      this.setActive(this.tabs[index + 1].name)
    } else {
      this.setActive(this.tabs[0].name)
    }
  }

  listenChanges = callback => {
    this.onChangeListeners.push(callback)
  }

  removeTab = tab => {
    this.tabs.splice(this.tabs.findIndex(({ name }) => tab.name === name), 1)
    el(`#${tab.name}`).remove()
  }
}

window.Tabs = new FlamebirdTabs(el('.wrapper'), el('#tabs'))
