import _ from 'lodash'
import kinka from 'kinka'

export default class Api {
  runTask = taskId => kinka.post(`/run/${taskId}`)
  stopTask = taskId => kinka.post(`/stop/${taskId}`)
  getProjectInfo = () => kinka.get('/info')
  getProjectVersion = () => kinka.get('/project-version')
  clearLogs = taskId => kinka.post(`/clear-logs/${taskId}`)
  getLogs = taskId => kinka.get(`/logs/${taskId}`)
  updateEnvs = (taskId, envs) =>
    kinka.post('/update-envs', {
      id: taskId,
      envs: _.clone(envs),
    })
}
