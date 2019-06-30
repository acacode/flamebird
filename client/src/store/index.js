import {StonexStore} from 'stonex'
import Tabs from './modules/Tabs'
import Tasks from './modules/Tasks'
import App from './modules/App'

const store = new StonexStore({})

export const app = store.connectModule('app', App)
export const tabs = store.connectModule('tabs', Tabs)
export const tasks = store.connectModule('tasks', Tasks)

export default store