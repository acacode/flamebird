import $ from 'jquery'
import WindowAttached from '../helpers/WindowAttached'
import ThemeSwitcher, { THEMES } from '../scripts/ThemeSwitcher'
import { toggleClass, el as getEl } from './helpers/dom_utils'

export class Header extends WindowAttached('header') {
  themeSwitcher = new ThemeSwitcher({
    onSwitchTheme: newTheme => {
      $('.toggle.color').toggleClass('active', newTheme === THEMES.DARK)
    },
  })

  deps = {
    hotkeys: null,
  }

  fullscreen = !!localStorage.getItem('fullscreen')
  hotKeysEnabled = !!localStorage.getItem('hotkeys')
  notificationsEnabled = !!localStorage.getItem('notifications')

  constructor({ hotkeys }) {
    super()

    this.deps.hotkeys = hotkeys

    $(document).ready(() => {
      this.themeSwitcher.setTheme(localStorage.getItem('theme') || 'white')

      this.updateFullscreen()
      this.updateHotkeys()
      this.updateNotifications()
    })
  }

  handleThemeIconClick = () => {
    ThemeSwitcher.switchTheme()
  }

  handleResizeIconClick = () => {
    this.fullscreen = !this.fullscreen
    this.updateFullscreen()
  }

  handleNotificationsIconClick = () => {
    this.notificationsEnabled = !this.notificationsEnabled
    this.updateNotifications()
  }

  handleKeyboardIconClick = () => {
    this.hotKeysEnabled = !this.hotKeysEnabled
    this.updateHotkeys()
  }

  updateNotifications() {
    toggleClass(
      getEl('.main-button.notifications'),
      'active',
      this.notificationsEnabled
    )
    if (this.notificationsEnabled) {
      localStorage.setItem('notifications', true)
    } else {
      delete localStorage.notifications
      $('.task.updated').removeClass('updated')
    }
  }

  updateFullscreen() {
    toggleClass(getEl('.main-button.resize'), 'active', this.fullscreen)

    if (this.fullscreen) {
      localStorage.setItem('fullscreen', true)
      document.body.setAttribute('fullscreen', 'true')
    } else {
      document.body.removeAttribute('fullscreen')
      delete localStorage.fullscreen
    }
  }

  updateHotkeys() {
    toggleClass(getEl('.main-button.hot-keys'), 'active', this.hotKeysEnabled)
    this.deps.hotkeys.triggerEnabled(this.hotKeysEnabled)
  }
}
