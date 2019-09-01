import _ from 'lodash'
import api from './Api'
import { el, createEl } from '../helpers/dom_utils'

export default class ConfigsManager {
  configs = []
  activeConfigIndex = 0

  refreshConfigs = async () => {
    const {
      data: { configs },
    } = await api.getProjectInfo()
    this.configs = configs
    if (!this.getActiveConfig()) {
      this.setConfig(0)
    }

    const configsContainerEl = el(this.configsContainer)
    configsContainerEl.innerHTML = ''

    this.configs.forEach((config, index) =>
      createEl('div', {
        className: 'config',
        innerText: config.name,
        onclick: () => this.setConfig(index),
        parent: configsContainerEl,
      })
    )
  }

  setConfig = (index = 0) => {
    this.activeConfigIndex = index

    this.onSetConfig(this.getActiveConfig())
  }

  getActiveConfig = () => this.configs[this.activeConfigIndex]

  constructor(configsContainer, { onSetConfig }) {
    this.configsContainer = configsContainer
    // this.configs = configs
    this.onSetConfig = onSetConfig || _.noop
  }
}
