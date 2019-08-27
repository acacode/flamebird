import _ from 'lodash'
import { el, createEl } from '../helpers/dom_utils'
import { createTab } from '../helpers/tabs'

const WRAPPER_ELEMENT = '.wrapper'
const TABS_CONTAINER = '#tabs'
const ACTIVE_TAB_CLASSNAME = 'active'

export const PRIORITY_TAB = createTab('procfile', true)

export const DEFAULT_TABS = [
  createTab('npm'),
  PRIORITY_TAB,
  createTab('grunt'),
  createTab('gulp'),
]

class Tabs {
  wrapper = null
  onChangeListeners = []

  tabs = [...DEFAULT_TABS]

  activeTab = _.find(this.tabs, { active: true })

  constructor(wrapperElementQuery, tabsContainerQuery) {
    const tabsContainer = el(tabsContainerQuery)
    const wrapperElement = el(wrapperElementQuery)

    this.wrapper = wrapperElement
    this.tabs.forEach(tab => {
      createEl('button', {
        className: 'tab' + (tab.active ? ` ${ACTIVE_TAB_CLASSNAME}` : ''),
        id: tab.name,
        innerText: tab.name,
        onclick: () => this.setActive(tab.name),
        parent: tabsContainer,
      })
    })
  }

  getAll = () => this.tabs

  getTabBy = partialTabData => _.find(this.tabs, partialTabData)

  getNotActiveTabs = () => this.getTabBy({ active: false })

  getTab = name => this.getTabBy({ name })

  getActive = () => this.activeTab

  setActive = name => {
    const prevTab = this.activeTab
    // if (prevTab.name !== name) {
    if (this.getTab(prevTab.name)) {
      prevTab.active = false
      el(`#${prevTab.name}`).classList.remove(ACTIVE_TAB_CLASSNAME)
    }
    this.activeTab = this.getTab(name)
    this.activeTab.active = true

    el(`#${this.activeTab.name}`).classList.add(ACTIVE_TAB_CLASSNAME)

    if (this.onChangeListeners.length) {
      this.onChangeListeners.forEach(listener =>
        listener(this.activeTab.name, prevTab.name)
      )
    }
    this.wrapper.className = `wrapper active-tab-${this.activeTab.name}`
    return this.activeTab
  }

  setNextAsActive() {
    const index = this.tabs.findIndex(tab => tab.name === this.activeTab.name)
    if (_.isUndefined(this.tabs[index + 1])) {
      this.setActive(this.tabs[0].name)
    } else {
      this.setActive(this.tabs[index + 1].name)
    }
  }

  listenChanges = callback => {
    this.onChangeListeners.push(callback)
  }

  removeTab = tab => {
    const removingTabIndex = this.tabs.findIndex(
      ({ name }) => tab.name === name
    )
    if (removingTabIndex !== -1) {
      this.tabs.splice(removingTabIndex, 1)
      el(`#${tab.name}`).remove()
    }
  }
}

export default new Tabs(WRAPPER_ELEMENT, TABS_CONTAINER)
