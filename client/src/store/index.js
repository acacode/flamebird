import { StonexStore } from 'stonex'
import Tabs from './modules/Tabs'
import Tasks from './modules/Tasks'
import App from './modules/App'
import Extensions from './modules/Extensions'
import { writable } from 'svelte/store'

const store = new StonexStore({
  app: App,
  tabs: Tabs,
  tasks: Tasks,
  extensions: Extensions
})

export const actions = Object.keys(store.modules).reduce(
  (modulesMap, moduleName) => {
    const module = store.modules[moduleName]
    modulesMap[moduleName] = Object.keys(module).reduce(
      (actions, actionName) => {
        if (typeof module[actionName] === 'function') {
          actions[actionName] = module[actionName]
        }
        return actions
      },
      {}
    )
    return modulesMap
  },
  {}
)

const createSvelteState = () => {
  let timer = null

  const closured = store.stateWorker.setState.bind(store.stateWorker)

  const stateStore = writable(store.createStateSnapshot())

  const updateSvelte = () => {
    stateStore.update(() => store.createStateSnapshot())
  }
  store.stateWorker.setState = (...args) => {
    const result = closured(...args)
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(updateSvelte)
    return result
  }
  return stateStore
}

const stonexState = createSvelteState()

export const getState = () => stonexState

export default store
