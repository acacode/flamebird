export default {
  state: {
    theme: false,
    fullscreen: false,
    notifications: false,
    hotkeys: false
  },

  toggleProp(propName) {
    this.setState({ ...this.state, [propName]: !this.state[propName] })
  },

  toggleTheme() {
    this.toggleProp("theme")
  },
  toggleFullscreen() {
    this.toggleProp("fullscreen")
  },
  toggleNotifications() {
    this.toggleProp("notifications")
  },
  toggleHotkeys() {
    this.toggleProp("hotkeys")
  }
}
