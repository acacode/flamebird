import _ from 'lodash'
import kinka from 'kinka'

export default new (class Api {
  getProjectInfo = () => kinka.get('/info')
  getProjectVersion = () => kinka.get('/project-version')
  runTask = (configId, taskId) => kinka.post(`/${configId}/${taskId}/run`)
  stopTask = (configId, taskId) => kinka.post(`/${configId}/${taskId}/stop`)
  clearLogs = (configId, taskId) => kinka.delete(`/${configId}/${taskId}/logs`)
  getLogs = (configId, taskId) => kinka.get(`/${configId}/${taskId}/logs`)
  removeConfig = configId => kinka.delete(`/${configId}`)
  updateEnvs = (configId, taskId, envs) =>
    kinka.post(`/${configId}/${taskId}/envs`, _.clone(envs))
})()
