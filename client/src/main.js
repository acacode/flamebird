import App from "./components/App.html"
import store from "./store"

const initializeApp = async () => {
  const appInfo = await store.modules.app.getInfo()
  store.modules.tasks.createTasks(appInfo.tasksMap)
  const app = new App({ target: document.body })

  return app
}

export default initializeApp()
