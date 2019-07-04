import api from '../../api'
import AppInfo from '../models/AppInfo'

export default {
  state: {},
  async getInfo() {
    const { data } = await api.get('/info')
    const appInfo = new AppInfo(data)
    this.setState(appInfo)
    return appInfo
  }
}
