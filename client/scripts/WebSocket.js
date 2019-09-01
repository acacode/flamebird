import _ from 'lodash'
const { MESSAGE_TYPES } = require('../../server/constants')

export default class WebSocket {
  connection = null

  constructor(url, { onConnection, onLogUpdate, onAppListUpdate } = {}) {
    this.onConnection = onConnection || _.noop
    this.onLogUpdate = onLogUpdate || _.noop
    this.onAppListUpdate = onAppListUpdate || _.noop

    this.connection = new window.WebSocket(url)
    this.connection.onmessage = this.handleMessageReceive
  }

  handleMessageReceive = ({ data }) => {
    const { type, message } = JSON.parse(data)

    switch (type) {
      case MESSAGE_TYPES.CONNECTION:
        return this.onConnection(message)
      case MESSAGE_TYPES.LOG:
        return this.onLogUpdate(message)
      case MESSAGE_TYPES.APPS_LIST_UPDATE:
        return this.onAppListUpdate(message)
      default:
    }
  }
}
