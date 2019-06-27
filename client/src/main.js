import App from "./components/App.svelte"

export default new App({
	target: document.body,
	props: {
		name: "world"
	}
})
