class FlamebirdTabs {
  wrapper = null

  changeListeners = []

  tabs = [
    { name: 'npm' },
    { name: 'procfile', active: true },
    { name: 'grunt' },
    { name: 'gulp' },
  ]

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

  getActive = () => _.find(this.tabs, { active: true })

  setActive = name => {
    const prevTab = this.getActive()
    // if (prevTab.name !== name) {
    prevTab.active = false
    el(`#${prevTab.name}`).classList.remove('active')
    const nextTab = this.getTab(name)
    nextTab.active = true
    el(`#${nextTab.name}`).classList.add('active')
    if (this.changeListeners.length) {
      this.changeListeners.forEach(listener =>
        listener(nextTab.name, prevTab.name)
      )
    }
    this.wrapper.className = `wrapper active-tab-${nextTab.name}`
    return nextTab
    // }
    // return null
  }

  listenChanges = callback => {
    this.changeListeners.push(callback)
    return this
  }

  removeTab = tab => {
    el(`#${tab.name}`).remove()
  }
}

window.Tabs = new FlamebirdTabs(el('.wrapper'), el('#tabs'))
