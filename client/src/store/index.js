import { StonexStore } from 'stonex'
import Tabs from './modules/Tabs'
import Tasks from './modules/Tasks'
import App from './modules/App'
import { writable } from 'svelte/store'

const store = new StonexStore({
	app: App,
	tabs: Tabs,
	tasks: Tasks,
})

export const actions = Object.keys(store.modules).reduce((acc, key) => {
	const module = store.modules[key]
	acc[key] = Object.keys(module).reduce((acc, key) => {
		if(typeof module[key] === 'function') {
			acc[key] = module[key]
		}
		return acc
	}, {})
	return acc
}, {})

export const useState = () => {
	const closured = store.stateWorker.setState.bind(store.stateWorker)

	const stateStore = writable(store.createStateSnapshot())

	const updateSvelte = () => {
		stateStore.update(() => store.createStateSnapshot()) // logs '2'
	}
	store.stateWorker.setState = (...args) => {
		const result = closured(...args)
		console.log('args', args)
		if(typeof args[1] === 'function') {
			setTimeout(updateSvelte)
		}else {
			updateSvelte()
		}
		return result
	}
	return stateStore
}

export default store