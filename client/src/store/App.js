import api from '../api'

export default {
	state: {
		name: 'flamebird',
		commands: [],
	},
	async getInfo() {
		const { data } = await api.get('/info')
		this.setState(data)
		return data
	}
}