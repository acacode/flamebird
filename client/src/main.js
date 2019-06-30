import App from "./components/App.svelte"
import store from './store'


const initializeApp = async () => {
	const appInfo = await store.modules.app.getInfo()
	store.modules.tasks.createTasks(appInfo.commands)
	return new App({
		target: document.body,
		props: {
			name: "world"
		}
	})
}

export default initializeApp()
