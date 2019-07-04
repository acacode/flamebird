export default {
  state: {
    theme: false,
    fullscreen: false,
    notifications: false,
    hotkeys: false
    // activeTheme: 'white'
  },

  toggleTheme() {
    const theme = !this.state.theme
    const activeTheme = theme ? 'dark' : 'white'
    this.setState({ ...this.state, theme })
    document.body.setAttribute('theme', activeTheme)
  },
  toggleFullscreen() {
    this.setState({ ...this.state, fullscreen: !this.state.fullscreen })
  },
  toggleNotifications() {
    this.setState({ ...this.state, notifications: !this.state.notifications })
  },
  toggleHotkeys() {
    this.setState({ ...this.state, hotkeys: !this.state.hotkeys })
  }
}
