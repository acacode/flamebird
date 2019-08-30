export default class WebSocket {
  connection = null

  constructor(url, onReceiveMessage) {
    this.onReceiveMessage = onReceiveMessage
    this.connection = new window.WebSocket(url)
    this.connection.onmessage = this.handleMessageReceive
  }

  handleMessageReceive = (...args) => {
    this.onReceiveMessage(...args)
  }
}
