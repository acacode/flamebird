import _ from 'lodash'
import { el, createEl } from '../helpers/dom_utils'

export default class ConfigsManager {
  configs = []
  activeConfigIndex = 0

  refreshConfigs = async () => {
    const configs = await this.getConfigs()
    this.configs = configs
    if (!this.getActiveConfig()) {
      this.setConfig(0)
    }
    this.refreshHtml()
  }

  refreshHtml = () => {
    const configsContainerEl = el(this.configsContainer)
    configsContainerEl.innerHTML = ''

    this.configs.forEach((config, index) =>
      createEl('div', {
        className: 'config',
        children: [
          createEl('span', {
            className: 'name',
            innerText: config.name,
          }),
          index &&
            createEl('i', {
              className: 'fas fa-times close-icon',
              onclick: () => {
                window.event.preventDefault()
                this.removeConfig(index)
              },
            }),
        ],
        onclick: () => this.setConfig(index),
        parent: configsContainerEl,
      })
    )
  }

  setConfig = (index = 0) => {
    this.activeConfigIndex = index

    this.onSetConfig(this.getActiveConfig())
  }

  getConfig = (index = 0) => {
    return this.configs[index]
  }

  removeConfig = index => {
    const [removedConfig] = this.configs.splice(index, 1)
    this.onRemoveConfig(removedConfig, index)

    this.refreshHtml()
  }

  getActiveConfig = () => this.configs[this.activeConfigIndex]

  constructor(configsContainer, { onSetConfig, getConfigs, onRemoveConfig }) {
    this.configsContainer = configsContainer
    // this.configs = configs
    this.onSetConfig = onSetConfig || _.noop
    this.onRemoveConfig = onRemoveConfig || _.noop
    this.getConfigs = getConfigs || _.noop
  }
}
