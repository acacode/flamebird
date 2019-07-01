import {StonexStore} from 'stonex'
import Tabs from './modules/Tabs'
import Tasks from './modules/Tasks'
import App from './modules/App'

const store = new StonexStore({
	app: App,
	tabs: Tabs,
	tasks: Tasks,
})

export const app = store.modules.app
export const tabs = store.modules.tabs
export const tasks = store.modules.tasks

export default store